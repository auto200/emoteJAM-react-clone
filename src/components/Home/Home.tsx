import { DownloadIcon } from "@chakra-ui/icons";
import {
  Button,
  Divider,
  Flex,
  Heading,
  Link,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Favicon from "react-favicon";
import { AppState, RenderData } from "../../utils/interfaces";
import kekwFavicon from "../../utils/kekwFavicon";
import DropZoneOverlay from "../DropZoneOverlay";
import Footer from "../Footer";
import GithubLink from "../GithubIcon";
import { Step1, Step2, Step3 } from "../Steps";
import { removeFileNameExt, renderGif } from "./utils";

interface RenderedGif {
  name: string;
  src: string;
}

const Home = () => {
  const [appState, setAppState] = useState<AppState>("initial");
  const [selectedFilterName, setSelectedFilterName] = useState<string>("");
  const [webGlError, setWebGlError] = useState<string>("");
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>(
    "/imgs/tsodinClown.png"
  );
  const [renderData, setRenderData] = useState<RenderData>({});
  const [renderedGif, setRenderedGif] = useState<RenderedGif>({
    name: "",
    src: "",
  });

  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gifRendererRef = useRef<any>();
  const renderedGifsCacheRef = useRef<{ [key: string]: RenderedGif }>({});

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
      setWebGlError("Could not initialize WebGL context");
      return;
    }
  }, []);

  useEffect(() => {
    if (!uploadedImageSrc) return;

    //clear cache
    {
      Object.values(renderedGifsCacheRef.current).map(({ src }) =>
        URL.revokeObjectURL(src)
      );
      renderedGifsCacheRef.current = {};
    }

    const image = new window.Image();
    image.src = uploadedImageSrc;

    image.addEventListener("error", () => {
      if (!fileInputRef.current) return;
      fileInputRef.current.value = "";
      setUploadedImageSrc("/imgs/error.png");
      toast({
        title: "Failed to convert image",
        status: "error",
        position: "bottom-left",
      });
    });
  }, [uploadedImageSrc]);

  // auto render image on filter change
  useEffect(() => {
    if (!renderData[selectedFilterName] || !fileInputRef.current) return;

    const cachedGif = renderedGifsCacheRef.current[selectedFilterName];
    if (cachedGif) {
      setRenderedGif(cachedGif);
      return;
    }

    setAppState("rendering");

    if (gifRendererRef.current?.running) {
      gifRendererRef.current.abort();
    }
    const file = fileInputRef.current.files?.[0];
    const filename = file ? removeFileNameExt(file.name) : "result";

    gifRendererRef.current = renderGif(...renderData[selectedFilterName]);

    gifRendererRef.current.on("finished", (blob: Blob) => {
      const renderedGif = {
        name: `${filename}-${selectedFilterName}.gif`,
        src: URL.createObjectURL(blob),
      };
      renderedGifsCacheRef.current[selectedFilterName] = renderedGif;
      setRenderedGif(renderedGif);
      gifRendererRef.current.abort();
      setAppState("rendered");
    });
  }, [selectedFilterName]);

  const handleFileUpload = (file: File) => {
    setAppState("initial");
    setUploadedImageSrc(URL.createObjectURL(file));
    setRenderedGif({
      name: "",
      src: "",
    });
    setSelectedFilterName("");
  };

  return (
    <Flex justifyContent="center">
      <Favicon url={kekwFavicon} animationDelay={50} />
      <GithubLink />
      <Flex
        maxW="800px"
        p="0 10px"
        textAlign="center"
        justifyContent="center"
        alignItems="center"
        flexDir="column"
      >
        {webGlError && webGlError}

        {!webGlError && (
          <>
            <DropZoneOverlay
              handleFileDrop={(e: DragEvent) => {
                const file = e.dataTransfer?.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <Heading mt="50px" mb="5px">
              Upload an image to animate
            </Heading>
            <Text>
              Fully{" "}
              <Text as="span" fontWeight="bold" background="black" px="3px">
                Black (#000000)
              </Text>{" "}
              color is not supported and will become tansparent on rendered gif
            </Text>
            <Step1
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
            />
            <Step2
              selectedFilterName={selectedFilterName}
              setSelectedFilterName={setSelectedFilterName}
              setRenderData={setRenderData}
              uploadedImageSrc={uploadedImageSrc}
            />
            <Divider m="10px" mb="0" />
            <Step3 appState={appState} renderedImageSrc={renderedGif.src} />
            <Button
              w="140px"
              m="15px"
              as={Link}
              isLoading={appState === "rendering"}
              isDisabled={appState === "initial"}
              loadingText="Rendering"
              spinnerPlacement="end"
              href={renderedGif.src}
              download={renderedGif.name}
              colorScheme="teal"
              rightIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </>
        )}
        <Footer />
      </Flex>
    </Flex>
  );
};

export default Home;
