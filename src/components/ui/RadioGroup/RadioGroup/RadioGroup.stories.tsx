import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'デフォルト',
  render: (args) => (
    <RadioGroup defaultValue="option1" {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm font-medium">
          オプション1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-sm font-medium">
          オプション2
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="text-sm font-medium">
          オプション3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  name: '水平配置',
  render: (args) => (
    <RadioGroup defaultValue="option1" orientation="horizontal" {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="h-option1" />
        <label htmlFor="h-option1" className="text-sm font-medium">
          左
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="h-option2" />
        <label htmlFor="h-option2" className="text-sm font-medium">
          中央
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="h-option3" />
        <label htmlFor="h-option3" className="text-sm font-medium">
          右
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  name: '無効化',
  render: (args) => (
    <RadioGroup defaultValue="option1" {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="d-option1" />
        <label htmlFor="d-option1" className="text-sm font-medium">
          有効なオプション
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="d-option2" disabled />
        <label htmlFor="d-option2" className="text-sm font-medium text-gray-400">
          無効なオプション
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="d-option3" />
        <label htmlFor="d-option3" className="text-sm font-medium">
          もう一つの有効なオプション
        </label>
      </div>
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  name: '説明付き',
  render: (args) => (
    <RadioGroup defaultValue="option1" {...args}>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="option1" id="desc-option1" className="mt-1" />
        <div className="flex flex-col">
          <label htmlFor="desc-option1" className="text-sm font-medium">
            小さいサイズ
          </label>
          <p className="text-xs text-gray-500">
            最大1MBまでのファイルサイズ
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="option2" id="desc-option2" className="mt-1" />
        <div className="flex flex-col">
          <label htmlFor="desc-option2" className="text-sm font-medium">
            中サイズ
          </label>
          <p className="text-xs text-gray-500">
            最大5MBまでのファイルサイズ
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="option3" id="desc-option3" className="mt-1" />
        <div className="flex flex-col">
          <label htmlFor="desc-option3" className="text-sm font-medium">
            大きいサイズ
          </label>
          <p className="text-xs text-gray-500">
            最大10MBまでのファイルサイズ
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
};