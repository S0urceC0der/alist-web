import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  useToast,
  useDisclosure,
  HStack,
  Button,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import admin from "../../utils/admin";
import FormItem from "../../components/form-item";

interface Meta {
  path: string;
  password: string;
  hide: string;
}

const EmptyMeta = {
  path: "",
  password: "",
  hide: "",
};

const Metas = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [metas, setMetas] = React.useState<Meta[]>([]);
  const [currentMeta, setCurrentMeta] = React.useState<Meta>(EmptyMeta);
  const [isEdit, setIsEdit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const editDisclosure = useDisclosure();
  const refreshMetas = () => {
    setLoading(true);
    admin.get("metas").then((resp) => {
      setLoading(false);
      const res = resp.data;
      if (res.code !== 200) {
        toast({
          title: t(res.message),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMetas(res.data);
      }
    });
  };
  useEffect(() => {
    refreshMetas();
  }, []);
  return (
    <Box w="full">
      <HStack>
        <Button
          onClick={() => {
            setCurrentMeta(EmptyMeta);
            setIsEdit(false);
            editDisclosure.onOpen();
          }}
        >
          {t("add")}
        </Button>
        <Button
          colorScheme="orange"
          isLoading={loading}
          onClick={() => {
            refreshMetas();
          }}
        >
          {t("refresh")}
        </Button>
      </HStack>
      <Box overflowX="auto">
        <Table w="full">
          <Thead>
            <Tr>
              <Th>{t("path")}</Th>
              <Th>{t("password")}</Th>
              <Th>{t("hide")}</Th>
              <Th>{t("operation")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {metas.map((meta) => {
              return (
                <Tr key={meta.path}>
                  <Td>{meta.path}</Td>
                  <Td>{meta.password}</Td>
                  <Td>{meta.hide}</Td>
                  <Td>
                    <Button
                      onClick={() => {
                        setCurrentMeta(meta);
                        setIsEdit(true);
                        editDisclosure.onOpen();
                      }}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      colorScheme="red"
                      ml="1"
                      onClick={() => {
                        admin
                          .delete("meta", { params: { path: meta.path } })
                          .then((resp) => {
                            const res = resp.data;
                            if (res.code !== 200) {
                              toast({
                                title: t(res.message),
                                status: "error",
                                duration: 3000,
                                isClosable: true,
                              });
                            } else {
                              toast({
                                title: t(res.message),
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                              });
                              refreshMetas();
                            }
                          });
                      }}
                    >
                      {t("delete")}
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      <Modal
        isOpen={editDisclosure.isOpen}
        onClose={editDisclosure.onClose}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("add") + " / " + t("save")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing="2">
              {[
                { name: "path", description: "Path" },
                { name: "password", description: "Password" },
                { name: "hide", description: "Hide Files(split by ,)" },
              ].map((item) => {
                return (
                  <FormItem
                    key={item.name}
                    label={item.name}
                    type="string"
                    description={item.description}
                    value={(currentMeta as any)[item.name]}
                    required={item.name === "path"}
                    readOnly={isEdit&&item.name==="path"}
                    onChange={(value) => {
                      setCurrentMeta({
                        ...currentMeta,
                        [item.name]: value,
                      });
                    }}
                  />
                );
              })}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                admin.post("meta", currentMeta).then((resp) => {
                  const res = resp.data;
                  if (res.code !== 200) {
                    toast({
                      title: t(res.message),
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                    });
                  } else {
                    toast({
                      title: t(res.message),
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                    });
                    refreshMetas();
                    editDisclosure.onClose();
                  }
                });
              }}
            >
              {t("save")}
            </Button>
            <Button onClick={editDisclosure.onClose}>{t("cancle")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Metas;
