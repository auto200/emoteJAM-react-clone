import { Link } from "@chakra-ui/react";
import { GoMarkGithub } from "react-icons/go";

const GithubLink = () => {
  return (
    <Link
      isExternal
      href="https://github.com/auto200/emoteJAM-react-clone"
      pos={["absolute", null, "fixed"]}
      top="8px"
      right="8px"
      fontSize="4xl"
      zIndex="10"
    >
      <GoMarkGithub />
    </Link>
  );
};

export default GithubLink;
