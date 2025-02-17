import { prisma } from 'db';

import type { PageMeta } from '../interfaces';

export function getPageMetaList(pageIds: string[]): Promise<PageMeta[]> {
  return prisma.page.findMany({
    where: {
      id: {
        in: pageIds
      }
    },
    select: {
      id: true,
      autoGenerated: true,
      boardId: true,
      bountyId: true,
      postId: true,
      cardId: true,
      createdAt: true,
      createdBy: true,
      deletedAt: true,
      fullWidth: true,
      galleryImage: true,
      hasContent: true,
      headerImage: true,
      icon: true,
      index: true,
      isTemplate: true,
      parentId: true,
      path: true,
      proposalId: true,
      snapshotProposalId: true,
      title: true,
      spaceId: true,
      updatedAt: true,
      updatedBy: true,
      type: true,
      permissions: {
        select: {
          id: true,
          pageId: true,
          permissionLevel: true,
          public: true,
          roleId: true,
          spaceId: true,
          userId: true,
          permissions: true
        }
      }
    }
  });
}
