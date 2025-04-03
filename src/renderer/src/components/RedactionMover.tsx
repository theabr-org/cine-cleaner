import { useVideoData } from '@renderer/context/useVideoData'
import { Actions, Redaction } from '@renderer/store'
import { Component, onCleanup, onMount } from 'solid-js'

type RedactionMoverProps = {
  redaction: Redaction
  maxCoords: { x: number; y: number }
}
export const RedactionMover: Component<RedactionMoverProps> = (props) => {
  const [, dispatch] = useVideoData()
  const onMouseDown = (e: MouseEvent): void => {
    e.stopPropagation()
    const newPosition = {
      x: e.clientX,
      y: e.clientY
    }
    dispatch({
      type: Actions.StartDragRedaction,
      payload: {
        key: props.redaction.key,
        newPosition
      }
    })
  }
  const onMouseMove = (e: MouseEvent): void => {
    const { key, isDragging, isSelected, currentPosition } = props.redaction
    if (currentPosition === null || !isDragging || !isSelected) {
      return
    }

    const newPosition = {
      x: e.clientX,
      y: e.clientY
    }
    const dx = newPosition.x - currentPosition.x
    const dy = newPosition.y - currentPosition.y

    const maxX = props.maxCoords.x - props.redaction.width
    const maxY = props.maxCoords.y - props.redaction.height

    const newX = props.redaction.x + dx
    const newY = props.redaction.y + dy

    dispatch({
      type: Actions.DragRedaction,
      payload: {
        key,
        x: newX < 0 ? 0 : newX > maxX ? maxX : newX,
        y: newY < 0 ? 0 : newY > maxY ? maxY : newY,
        newPosition
      }
    })
  }
  const onMouseUp = (e: MouseEvent): void => {
    e.stopPropagation()
    dispatch({ type: Actions.StopDragRedaction, payload: props.redaction.key })
  }

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

  onCleanup(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  })

  return (
    <div
      class="cursor-move w-full h-full"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    ></div>
  )
}
