import { Flex, Tag } from '@chakra-ui/react';
import { version } from '../../../package.json';

export function Tags() {
  return (
    <Flex
      pos="absolute"
      bottom="4"
      left="8"
      right="8"
      gap="2"
      justify="space-between"
    >
      <iframe
        src="https://ghbtns.com/github-btn.html?user=SilvanoGPM&repo=cards-against-humanity&type=star&count=true&size=large"
        style={{ textAlign: 'center' }}
        width="170"
        height="30"
        title="GitHub"
      />

      <Tag bg="black" color="white" w="fit-content">
        {version}.beta
      </Tag>
    </Flex>
  );
}
