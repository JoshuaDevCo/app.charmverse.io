import { IdentityType } from '@prisma/client';
import getENSName from 'lib/blockchain/getENSName';
import { DiscordAccount } from 'lib/discord/getDiscordAccount';
import log from 'lib/log';
import { shortenHex } from 'lib/utilities/strings';
import { TelegramAccount } from 'pages/api/telegram/connect';
import { prisma } from '../db';

(async () => {

  const users = await prisma.user.findMany({
    where: {
      identityType: null
    },
    include: {
      discordUser: true,
      telegramUser: true,
      wallets: true
    }
  });

  log.info('found', users.length, 'users missing identity type');

  let ensFound = 0;

  await Promise.all(users.map(async user => {
    if (!user.wallets.length) {
      return;
    }
    const address = user.wallets[0]?.address;
    const ens = await getENSName(address);

    if (ens) {
      // @ts-ignore
      user.ensName = ens || undefined;
      ensFound += 1;
    }
  }));

  log.info('Found', ensFound, 'ens names');

  const identityTypes = {
    wallet: 0,
    telegram: 0,
    discord: 0
  };

  await prisma.$transaction(
    users.map((user) => {
      if (!user.username && user.wallets[0]?.address) {

        identityTypes.wallet += 1;

        return prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            identityType: 'Wallet',
            // @ts-ignore
            username: user.ensName || shortenHex(user.wallets[0].address)
          }
        });
      }

      let identityType: IdentityType = 'Wallet';
      const discordAccount = user.discordUser ? user.discordUser.account as Partial<DiscordAccount> : null;
      const telegramAccount = user.telegramUser ? user.telegramUser.account as Partial<TelegramAccount> : null;

      if (user.discordUser
            && discordAccount
            && discordAccount.username === user.username) {
        // Check for scenario in which user has both Discord and Telegram, same username, but connected with Telegram last.
        identityType = telegramAccount
                            && telegramAccount.username === user.username
                            && user.telegramUser
                            && user.telegramUser.createdAt > user.discordUser.createdAt
          ? 'Telegram' : 'Discord';
      }
      else if (telegramAccount
        && (telegramAccount.username === user.username || user.username === `${telegramAccount.first_name} ${telegramAccount.last_name}`)) {
        identityType = 'Telegram';
      }
      if (identityType === 'Discord') {
        identityTypes.discord += 1;
      }
      else {
        identityTypes.telegram += 1;
      }

      return prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          identityType
        }
      });
    })
  );

  log.info('set identity types', identityTypes);

})();
