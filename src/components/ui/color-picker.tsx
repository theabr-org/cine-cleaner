import { Component, createSignal } from 'solid-js';
import { cn } from './cn';

type Props = {
  value?: 'black' | 'white';
  onChange?: (color: 'black' | 'white') => void;
  class?: string;
};

const COLORS = [
  { name: 'black', border: 'border-neutral-900' },
  { name: 'white', border: 'border-neutral-500' },
] as const;

export const ColorPicker: Component<Props> = props => {
  const [selectedColor, setSelectedColor] = createSignal(
    props.value || COLORS[0].name
  );

  const handleColorSelect = (color: 'black' | 'white') => {
    setSelectedColor(color);
    props.onChange?.(color);
  };

  return (
    <div class={cn('grid grid-cols-2 gap-2 p-1 bg-white rounded', props.class)}>
      {COLORS.map(color => (
        <button
          type="button"
          class={cn(
            'w-4 h-4 rounded  border transition-transform hover:scale-110',
            selectedColor() === color.name ? color.border : ''
          )}
          style={{ background: color.name }}
          onClick={() => handleColorSelect(color.name)}
          title={color.name}
        />
      ))}
    </div>
  );
};
