import { IconFrame, IconHorizontalFrame, IconVerticalFrame } from '@/components/ui/Icon';
import { IconRadioGroup, IconRadioItem } from '@/components/ui/RadioGroup/IconRadioGroup';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import { Slider } from '@/components/ui/Slider';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import type { FrameControlsProps } from './types';

export const FrameControls = ({
  frameType,
  frameColor,
  frameWidth,
  onFrameTypeChange,
  onFrameColorChange,
  onFrameWidthChange,
}: FrameControlsProps) => {
  const handleFrameTypeChange = (value: string) => {
    onFrameTypeChange(value as typeof frameType);
  };

  const handleFrameColorChange = (value: string) => {
    onFrameColorChange(value as typeof frameColor);
  };

  const handleFrameWidthChange = (value: number[]) => {
    onFrameWidthChange(value[0]);
  };

  return (
    <>
      {/* Frame Type Selection */}
      <div className="w-full">
        <IconRadioGroup value={frameType} onValueChange={handleFrameTypeChange}>
          <IconRadioItem value="horizontal" icon={<IconHorizontalFrame />} />
          <IconRadioItem value="vertical" icon={<IconVerticalFrame />} />
          <IconRadioItem value="all" icon={<IconFrame />} />
        </IconRadioGroup>
      </div>

      {/* Frame Color Selection */}
      <div className="w-full">
        <RadioGroup value={frameColor} onValueChange={handleFrameColorChange}>
          <div className="flex justify-center gap-8">
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="white"
                id="white"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="white" className="text-sm font-medium text-gray-700">
                白
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="black"
                id="black"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="black" className="text-sm font-medium text-gray-700">
                黒
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Frame Width Slider */}
      <div className="w-full">
        <Slider
          value={[frameWidth]}
          onValueChange={handleFrameWidthChange}
          max={100}
          min={0}
          step={1}
        />
      </div>
    </>
  );
};