import { Box, Flex, Heading, Image, Spinner } from "@chakra-ui/react";
import React from "react";
import { IMAGE_SIZE } from "../../constants";
import { AppState } from "../../utils/interfaces";
import StepIndicator from "./shared/StepIndicator";

interface Step3Props {
  appState: AppState;
  renderedImageSrc: string;
}

const Step3: React.FC<Step3Props> = ({ appState, renderedImageSrc }) => {
  return (
    <>
      <Box pos="relative" w="90%" mb="15px" pt="10px">
        <StepIndicator step={3} />
        <Heading mt="10px">Get animated gif</Heading>
      </Box>
      <Flex
        w={`${IMAGE_SIZE}px`}
        h={`${IMAGE_SIZE}px`}
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        outline={appState === "initial" ? "solid 2px red" : ""}
      >
        {appState === "initial" && <Box>☝️Pick a filter to get the gif</Box>}
        {appState === "rendering" && <Spinner size="lg" />}
        {appState === "rendered" && <Image src={renderedImageSrc} />}
      </Flex>
    </>
  );
};

export default Step3;
