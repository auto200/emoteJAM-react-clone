import { Flex, Text } from "@chakra-ui/layout";
import { Dispatch, SetStateAction } from "react";
import { Filters } from "../filters";
import { Program, VertexAttribs } from "../pages";
import Preview from "./Preview";

interface Props {
  filters: Filters;
  currentFilterName: string;
  setRenderData: Dispatch<
    SetStateAction<{
      [key: string]: [WebGLRenderingContext, HTMLCanvasElement, Program];
    }>
  >;
  onClick: (filterName: string) => void;
  vertexAttribs: VertexAttribs;
  uploadedImageSrc: string;
}

const Previews: React.FC<Props> = ({
  filters,
  currentFilterName,
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
            padding="10px"
            outline={currentFilterName === name ? "2px solid #0f0" : ""}
            onClick={() => onClick(name)}
            _hover={{ cursor: "pointer" }}
          >
            <Text>{name}</Text>
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
