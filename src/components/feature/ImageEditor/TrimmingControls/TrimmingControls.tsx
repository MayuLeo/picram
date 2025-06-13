import { Button } from '@/components/ui/Button';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import type { TrimmingControlsProps } from './types';

export const TrimmingControls = ({
  aspectRatio,
  onAspectRatioChange,
  onCancel,
  onApply,
}: TrimmingControlsProps) => {
  const handleAspectRatioChange = (value: string) => {
    onAspectRatioChange(value as typeof aspectRatio);
  };

  return (
    <>
      {/* Aspect Ratio Selection */}
      <div className="w-full">
        <RadioGroup value={aspectRatio} onValueChange={handleAspectRatioChange}>
          <div className="flex justify-center gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="1:1"
                id="1:1"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="1:1" className="text-sm font-medium text-gray-700">
                1:1
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="16:9"
                id="16:9"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="16:9" className="text-sm font-medium text-gray-700">
                16:9
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="5:4"
                id="5:4"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="5:4" className="text-sm font-medium text-gray-700">
                5:4
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="7:5"
                id="7:5"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="7:5" className="text-sm font-medium text-gray-700">
                7:5
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex justify-center gap-4">
        <Button onClick={onCancel}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={onApply}>
          トリミング
        </Button>
      </div>
    </>
  );
};