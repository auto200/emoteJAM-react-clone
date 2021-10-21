import { Box, Text } from "@chakra-ui/layout";
import React from "react";

interface StepIndicatorProps {
  step: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step }) => {
  return (
    <Box pos="absolute" top="5px" left="5px">
      <Text color="lightpink" fontWeight="bold">
        Step {step}
      </Text>
    </Box>
  );
};

export default StepIndicator;
