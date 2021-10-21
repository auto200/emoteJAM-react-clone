import { Box, Flex } from "@chakra-ui/react";
import React, { ChangeEvent, RefObject } from "react";
import { BsUpload } from "react-icons/bs";
import StepIndicator from "./shared/StepIndicator";

interface Step1Props {
  fileInputRef: RefObject<HTMLInputElement>;
  onFileUpload: (file: File) => void;
}

const Step1: React.FC<Step1Props> = ({ fileInputRef, onFileUpload }) => {
  return (
    <Flex
      w="90%"
      h="175px"
      mt="25px"
      border="5px dashed"
      borderColor="limegreen"
      textAlign="center"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      onClick={() => {
        fileInputRef.current?.click();
      }}
      _hover={{ cursor: "pointer" }}
      pos="relative"
    >
      <StepIndicator step={1} />
      Select or drop an image
      <Box fontSize="3xl">
        <BsUpload />
      </Box>
      <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) onFileUpload(file);
        }}
      />
    </Flex>
  );
};

export default Step1;
