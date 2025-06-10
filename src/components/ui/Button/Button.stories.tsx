
import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'danger'],
    },
    children: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: 'プライマリボタン',
  args: {
    variant: 'primary',
    children: '保存',
  },
};

export const Danger: Story = {
  name: 'デンジャーボタン',
  args: {
    variant: 'danger',
    children: '削除',
  },
};

export const Disabled: Story = {
  name: '無効化ボタン',
  args: {
    variant: 'primary',
    children: '保存',
    disabled: true,
  },
};

export const LongText: Story = {
  name: '長いテキストボタン',
  args: {
    variant: 'primary',
    children: 'とても長いボタンテキストの例',
  },
};

export const CustomClassName: Story = {
  name: 'カスタムスタイルボタン',
  args: {
    variant: 'primary',
    children: '保存',
    className: 'w-32',
  },
};

export const AllVariants: Story = {
  name: '全バリエーション',
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">保存</Button>
      <Button variant="danger">削除</Button>
      <Button variant="primary" disabled>無効</Button>
    </div>
  ),
};