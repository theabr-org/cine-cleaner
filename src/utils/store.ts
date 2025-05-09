import { match } from 'ts-pattern';

export type Redaction = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VideoState = {
  videoSrc: string | null;
  videoDimensions: {
    width: number;
    height: number;
  } | null;
  previewMode: boolean;
  redactionColor: 'white' | 'black';
  redactions: Array<Redaction>;
};

export enum Actions {
  TogglePreviewMode = 'TOGGLE_PREVIEW_MODE',
  SetRedactionColor = 'SET_REDACTION_COLOR',
  SetVideoSrc = 'SET_VIDEO_SRC',
  AddRedaction = 'ADD_REDACTION',
  SetRedactionSize = 'SET_REDACTION_SIZE',
  SetRedactionPosition = 'SET_REDACTION_POSITION',
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
      type: Actions.SetRedactionSize;
      payload: {
        key: string;
        width: number;
        height: number;
        x: number;
        y: number;
      };
    }
  | {
      type: Actions.SetRedactionPosition;
      payload: {
        key: string;
        x: number;
        y: number;
      };
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
    }
  | {
      type: Actions.SetRedactionColor;
      payload: 'white' | 'black';
    };

export const reducer = (state: VideoState, action: VideoAction): VideoState =>
  match(action)
    .with({ type: Actions.TogglePreviewMode }, () => ({
      ...state,
      previewMode: !state.previewMode,
    }))
    .with({ type: Actions.SetVideoSrc }, ({ payload }) => ({
      ...state,
      videoSrc: payload,
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
        },
      ],
    }))

    .with({ type: Actions.SetRedactionPosition }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload.key
          ? {
              ...r,
              x: payload.x,
              y: payload.y,
            }
          : r
      ),
    }))

    .with({ type: Actions.SetRedactionSize }, ({ payload }) => ({
      ...state,
      redactions: state.redactions.map(r =>
        r.key === payload.key
          ? {
              ...r,
              width: payload.width,
              height: payload.height,
              x: payload.x,
              y: payload.y,
            }
          : r
      ),
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
    .with({ type: Actions.SetRedactionColor }, ({ payload }) => ({
      ...state,
      redactionColor: payload,
    }))
    .exhaustive();
