import { Box, Heading } from "@chakra-ui/react";
import React, { Dispatch, SetStateAction } from "react";
import { vertexAttribs } from "../../constants";
import filters from "../../filters";
import { RenderData } from "../../utils/interfaces";
import Previews from "../Previews";
import StepIndicator from "./shared/StepIndicator";

interface Step2Props {
  selectedFilterName: string;
  setRenderData: Dispatch<SetStateAction<RenderData>>;
  setSelectedFilterName: Dispatch<SetStateAction<string>>;
  uploadedImageSrc: string;
}

const Step2: React.FC<Step2Props> = ({
  selectedFilterName,
  setRenderData,
  setSelectedFilterName,
  uploadedImageSrc,
}) => {
  return (
    <>
      <Box pos="relative" w="90%" m="15px">
        <StepIndicator step={2} />
        <Heading mt="15px" mb="5px">
          Pick a filter:
        </Heading>
      </Box>
      <Previews
        filters={filters}
        selectedFilterName={selectedFilterName}
        setRenderData={setRenderData}
        onClick={(filterName: string) => {
          setSelectedFilterName(filterName);
        }}
        vertexAttribs={vertexAttribs}
        uploadedImageSrc={uploadedImageSrc}
      />
    </>
  );
};

export default Step2;
