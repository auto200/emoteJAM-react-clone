import { Flex, Link } from "@chakra-ui/layout";

const Footer = () => {
  return (
    <Flex mt="100px" mb="15px">
      <Link
        isExternal
        href="https://github.com/tsoding/emoteJAM"
        fontSize="xx-small"
      >
        Check out Tsoding's original version of the app
      </Link>
    </Flex>
  );
};

export default Footer;
