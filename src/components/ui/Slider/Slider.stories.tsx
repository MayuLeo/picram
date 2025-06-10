import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Slider } from './Slider';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: { type: 'object' },
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number' },
    },
    step: {
      control: { type: 'number' },
    },
    disabled: {
      control: 'boolean',
    },
    onValueChange: { action: 'value changed' },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'デフォルト',
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    className: 'w-80',
  },
};

export const Range: Story = {
  name: '範囲選択',
  args: {
    defaultValue: [25, 75],
    min: 0,
    max: 100,
    step: 1,
    className: 'w-80',
  },
};

export const SmallStep: Story = {
  name: '細かいステップ',
  args: {
    defaultValue: [2.5],
    min: 0,
    max: 10,
    step: 0.1,
    className: 'w-80',
  },
};

export const LargeStep: Story = {
  name: '大きなステップ',
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 10,
    className: 'w-80',
  },
};

export const Disabled: Story = {
  name: '無効化',
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    disabled: true,
    className: 'w-80',
  },
};

export const Vertical: Story = {
  name: '縦向き',
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 1,
    orientation: 'vertical',
    className: 'h-80',
  },
};

export const WithLabels: Story = {
  name: 'ラベル付き',
  render: (args) => (
    <div className="w-80">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-500">最小</span>
        <span className="text-sm text-gray-500">最大</span>
      </div>
      <Slider
        defaultValue={[30]}
        min={0}
        max={100}
        step={1}
        {...args}
      />
      <div className="flex justify-between mt-2">
        <span className="text-sm">0</span>
        <span className="text-sm">100</span>
      </div>
    </div>
  ),
};

export const ImageBorderSlider: Story = {
  name: '画像枠調整スライダー',
  render: (args) => (
    <div className="w-80">
      <label className="block text-sm font-medium mb-2">
        枠のサイズ
      </label>
      <Slider
        defaultValue={[20]}
        min={0}
        max={100}
        step={5}
        onValueChange={(value) => console.log('枠サイズ:', value[0])}
        {...args}
      />
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>なし</span>
        <span>最大</span>
      </div>
    </div>
  ),
};