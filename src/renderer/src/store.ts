import { match } from 'ts-pattern';

export type Redaction = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // As part of Solid granular reactivity we add these properties to track the state
  // of the mouse position when dragging or resizing the redaction
  currentPosition: { x: number; y: number } | null;
  isDragging: boolean;
  isResizing: boolean;
  isSelected: boolean;
};

export type VideoState = {
  videoSrc: string | null;
  videoPath: string | null;
  videoDimensions: {
    width: number;
    height: number;
  } | null;
  previewMode: boolean;
  redactions: Array<Redaction>;
};

export enum Actions {
  TogglePreviewMode = 'TOGGLE_PREVIEW_MODE',
  SetVideoSrc = 'SET_VIDEO_SRC',
  AddRedaction = 'ADD_REDACTION',
  StartDragRedaction = 'START_DRAG_REDACTION',
  StopDragRedaction = 'STOP_DRAG_REDACTION',
  DragRedaction = 'DRAG_REDACTION',
  StartResizeRedaction = 'START_RESIZE_REDACTION',
  StopResizeRedaction = 'STOP_RESIZE_REDACTION',
  ResizeRedaction = 'RESIZE_REDACTION',
  MouseLeave = 'MOUSE_LEAVE',
  ResizeVideo = 'RESIZE_VIDEO',
  SetVideoDimensions = 'SET_VIDEO_DIMENSIONS',
}

export type VideoAction =
  | {
      type: Actions.TogglePreviewMode;
    }
  | {
      type: Actions.SetVideoSrc;
      payload: string;
    }
  | {
      type: Actions.AddRedaction;
    }
  | {
      type: Actions.StartDragRedaction;
      payload: {
        key: string;
        newPosition: { x: number; y: number };
      };
    }
  | {
      type: Actions.StopDragRedaction;
      payload: string; // redaction key
    }
  | {
      type: Actions.DragRedaction;
      payload: {
        key: string;
        x: number;
        y: number;
        newPosition: { x: number; y: number };
      };
    }
  | {
      type: Actions.StartResizeRedaction;
      payload: {
        key: string;
        newPosition: { x: number; y: number };
      };
    }
  | {
      type: Actions.StopResizeRedaction;
      payload: string; // redaction key
    }
  | {
      type: Actions.ResizeRedaction;
      payload: {
        key: string;
        width: number;
        height: number;
        newPosition: { x: number; y: number };
      };
    }
  | {
      type: Actions.MouseLeave;
    }
  | {
      type: Actions.ResizeVideo;
      payload: {
        width: number;
        height: number;
      };
    }
  | {
      type: Actions.SetVideoDimensions;
      payload: {
        width: number;
        height: number;
      };
    };

export const reducer = (state: VideoState, action: VideoAction): VideoState =>
  match(action)
    .with({ type: Actions.TogglePreviewMode }, () => ({
      ...state,
      previewMode: !state.previewMode,
    }))
    .with({ type: Actions.SetVideoSrc }, ({ payload }) => ({
      ...state,
      videoSrc: `file://${payload}`,
      videoPath: payload,
    }))
    .with({ type: Actions.AddRedaction }, () => ({
      ...state,
      redactions: [
        ...state.redactions,
        {
          key: new Date().toISOString(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: 100,
          height: 20,
          currentPosition: null,
          isDragging: false,
          isResizing: false,
          isSelected: false,
        },
      ],
    }))
    .with({ type: Actions.StartDragRedaction }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload.key
          ? {
              ...r,
              isSelected: true,
              currentPosition: payload.newPosition,
              isDragging: true,
            }
          : {
              ...r,
              isSelected: false,
              currentPosition: null,
              isDragging: false,
            }
      ),
    }))
    .with({ type: Actions.StopDragRedaction }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload
          ? {
              ...r,
              isDragging: false,
              isSelected: false,
              currentPosition: null,
            }
          : r
      ),
    }))
    .with({ type: Actions.DragRedaction }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload.key
          ? {
              ...r,
              x: payload.x,
              y: payload.y,
              currentPosition: payload.newPosition,
            }
          : r
      ),
    }))
    .with({ type: Actions.StartResizeRedaction }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload.key
          ? {
              ...r,
              isSelected: true,
              currentPosition: payload.newPosition,
              isResizing: true,
            }
          : {
              ...r,
              isSelected: false,
              currentPosition: null,
              isResizing: false,
            }
      ),
    }))
    .with({ type: Actions.StopResizeRedaction }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload
          ? {
              ...r,
              isResizing: false,
              isSelected: false,
              currentPosition: null,
            }
          : r
      ),
    }))
    .with({ type: Actions.ResizeRedaction }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload.key
          ? {
              ...r,
              width: payload.width,
              height: payload.height,
              currentPosition: payload.newPosition,
            }
          : r
      ),
    }))
    .with({ type: Actions.MouseLeave }, () => ({
      ...state,
      redactions: state.redactions.map(r => ({
        ...r,
        isDragging: false,
        isResizing: false,
        isSelected: false,
        currentPosition: null,
      })),
    }))
    .with({ type: Actions.ResizeVideo }, ({ payload }) => {
      const videoDimensions = state.videoDimensions;
      if (!videoDimensions) {
        return state;
      }
      const { height, width } = videoDimensions;
      const heightRatio = payload.height / height;
      const widthRatio = payload.width / width;

      const nextRedactions = state.redactions.map(r => ({
        ...r,
        x: r.x * widthRatio,
        y: r.y * heightRatio,
        width: r.width * widthRatio,
        height: r.height * heightRatio,
      }));
      return {
        ...state,
        videoDimensions: {
          width: payload.width,
          height: payload.height,
        },
        redactions: nextRedactions,
      };
    })
    .with({ type: Actions.SetVideoDimensions }, ({ payload }) => ({
      ...state,
      videoDimensions: {
        width: payload.width,
        height: payload.height,
      },
    }))
    .exhaustive();
