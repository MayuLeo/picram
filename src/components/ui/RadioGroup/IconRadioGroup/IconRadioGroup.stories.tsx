import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { IconRadioGroup, IconRadioItem } from './IconRadioGroup';
import { IconFrame, IconHorizontalFrame, IconVerticalFrame } from '../../Icon/index';

const meta = {
  title: 'UI/IconRadioGroup',
  component: IconRadioGroup,
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
} satisfies Meta<typeof IconRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FrameOptions: Story = {
  name: '枠オプション',
  render: (args) => (
    <IconRadioGroup defaultValue="horizontal" {...args}>
      <IconRadioItem
        value="horizontal"
        icon={<IconHorizontalFrame />}
      />
      <IconRadioItem
        value="vertical"
        icon={<IconVerticalFrame />}
      />
      <IconRadioItem
        value="all"
        icon={<IconFrame />}
      />
    </IconRadioGroup>
  ),
};

export const Disabled: Story = {
  name: '無効化',
  render: (args) => (
    <IconRadioGroup defaultValue="horizontal" {...args}>
      <IconRadioItem
        value="horizontal"
        icon={<IconHorizontalFrame />}
      />
      <IconRadioItem
        value="vertical"
        disabled
        icon={<IconVerticalFrame />}
      />
      <IconRadioItem
        value="all"
        icon={<IconFrame />}
      />
    </IconRadioGroup>
  ),
};