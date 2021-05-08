import { Flex, Heading } from "@chakra-ui/layout";
import { useEffect, useState } from "react";

interface Props {
  handleFileDrop: (e: DragEvent) => void;
}
const DropZoneOverlay: React.FC<Props> = ({ handleFileDrop }) => {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter++;
      if (e?.dataTransfer?.items[0].kind === "file") {
        setShow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter--;
      if (dragCounter === 0) {
        setShow(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      handleFileDrop(e);

      dragCounter = 0;
      setShow(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  if (show) {
    return (
      <Flex
        pos="fixed"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bgColor="rgba(0, 0, 0, 0.75)"
        alignItems="center"
        justifyContent="center"
        p="25px"
        zIndex="10"
      >
        <Flex
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          border="5px dashed"
          borderColor="slategray"
          w="full"
          h="full"
        >
          <Heading size="4xl">Drop It Like It's Hot</Heading>
        </Flex>
      </Flex>
    );
  }
  return null;
};

export default DropZoneOverlay;
