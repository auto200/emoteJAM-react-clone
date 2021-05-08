import { Link } from "@chakra-ui/react";
import { GoMarkGithub } from "react-icons/go";

const GithubLink = () => {
  return (
    <Link
      isExternal
      href="https://github.com/auto200/emoteJAM-react-clone"
      pos="fixed"
      top="8px"
      right="8px"
      fontSize="4xl"
    >
      <GoMarkGithub />
    </Link>
  );
};

export default GithubLink;
