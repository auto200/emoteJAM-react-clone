import { Flex, Text } from "@chakra-ui/layout";
import { Dispatch, SetStateAction } from "react";
import { Filters } from "../filters";
import { Program, RenderData, VertexAttribs } from "../utils/interfaces";
import Preview from "./Preview";

interface Props {
  filters: Filters;
  selectedFilterName: string;
  setRenderData: Dispatch<SetStateAction<RenderData>>;
  onClick: (filterName: string) => void;
  vertexAttribs: VertexAttribs;
  uploadedImageSrc: string;
}

const Previews: React.FC<Props> = ({
  filters,
  selectedFilterName,
  onClick,
  setRenderData,
  vertexAttribs,
  uploadedImageSrc,
}) => {
  return (
    <Flex wrap="wrap" justifyContent="center">
      {Object.entries(filters).map(([name, filter]) => {
        const setRenderDataInfo = (
          gl: WebGLRenderingContext,
          canvas: HTMLCanvasElement,
          program: Program
        ) => {
          setRenderData((prev) => ({
            ...prev,
            [name]: [gl, canvas, program],
          }));
        };
        return (
          <Flex
            key={name}
            flexDirection="column"
            textAlign="center"
            m="15px"
            p="20px"
            pt="5px"
            outline={selectedFilterName === name ? "4px solid" : "1px solid"}
            outlineColor={selectedFilterName === name ? "gray.100" : "gray.700"}
            onClick={() => onClick(name)}
            _hover={{ cursor: "pointer" }}
          >
            <Text mt="0" fontWeight="bold">
              {name}
            </Text>
            <Preview
              filter={filter}
              vertexAttribs={vertexAttribs}
              imageSrc={uploadedImageSrc}
              setRenderDataInfo={setRenderDataInfo}
            />
          </Flex>
        );
      })}
    </Flex>
  );
};

export default Previews;
