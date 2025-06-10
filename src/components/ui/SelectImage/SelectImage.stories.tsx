import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SelectImage } from './SelectImage';

const meta = {
  title: 'UI/SelectImage',
  component: SelectImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onImageSelectAction: { action: 'image selected' },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof SelectImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'デフォルト',
  args: {
    onImageSelectAction: (file: File) => {
      console.log('Selected file:', file.name);
    },
  },
};

export const WithCustomClass: Story = {
  name: 'カスタムクラス',
  args: {
    onImageSelectAction: (file: File) => {
      console.log('Selected file:', file.name);
    },
    className: 'w-80',
  },
};

export const Small: Story = {
  name: 'スモールサイズ',
  args: {
    onImageSelectAction: (file: File) => {
      console.log('Selected file:', file.name);
    },
    className: 'w-48 p-6',
  },
};

export const Large: Story = {
  name: 'ラージサイズ',
  args: {
    onImageSelectAction: (file: File) => {
      console.log('Selected file:', file.name);
    },
    className: 'w-96 p-16',
  },
};

export const WithAction: Story = {
  name: 'アクション実行例',
  args: {
    onImageSelectAction: (file: File) => {
      alert(`選択されたファイル: ${file.name}\nサイズ: ${Math.round(file.size / 1024)}KB`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: '実際にファイルを選択すると、ファイル情報がアラートで表示されます。',
      },
    },
  },
};