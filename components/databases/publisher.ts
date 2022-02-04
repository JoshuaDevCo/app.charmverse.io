
import { batch } from 'react-redux';
import { updateBoards } from './focalboard/src/store/boards';
import { updateCards } from './focalboard/src/store/cards';
import { updateContents } from './focalboard/src/store/contents';
import { updateComments } from './focalboard/src/store/comments';
import { updateViews } from './focalboard/src/store/views';
import { Block } from './focalboard/src/blocks/block';
import { ContentBlock } from './focalboard/src/blocks/contentBlock';
import { CommentBlock } from './focalboard/src/blocks/commentBlock';
import { Board } from './focalboard/src/blocks/board';
import { Card } from './focalboard/src/blocks/card';
import { BoardView } from './focalboard/src/blocks/boardView';
import store from './focalboard/src/store';

// this code is normally called by a websocket connection in focalboard
export const publishIncrementalUpdate = async (blocks: Block[]) => {
  store.dispatch((dispatch) => {
    batch(() => {
      dispatch(updateBoards(blocks.filter((b: Block) => b.type === 'board' || b.deleteAt !== 0) as Board[]));
      dispatch(updateViews(blocks.filter((b: Block) => b.type === 'view' || b.deleteAt !== 0) as BoardView[]));
      dispatch(updateCards(blocks.filter((b: Block) => b.type === 'card' || b.deleteAt !== 0) as Card[]));
      dispatch(updateComments(blocks.filter((b: Block) => b.type === 'comment' || b.deleteAt !== 0) as CommentBlock[]));
      dispatch(updateContents(blocks.filter((b: Block) => b.type !== 'card' && b.type !== 'view' && b.type !== 'board' && b.type !== 'comment') as ContentBlock[]));
    });
  });
};
