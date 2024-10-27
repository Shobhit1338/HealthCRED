import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  Heading,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  useColorMode,
  IconButton,
  InputGroup,
  InputLeftElement,
  chakra,
  shouldForwardProp,
} from "@chakra-ui/react";
import {
  SunIcon,
  MoonIcon,
  CalendarIcon,
  InfoOutlineIcon,
  LockIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import { FaUser, FaIdCard } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, isValidMotionProp } from "framer-motion";

// Create a Box component
const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

const Onboarding = () => {
  // Validation schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First Name is required")
      .max(20, "Maximum 20 characters"),
    lastName: Yup.string()
      .required("Last Name is required")
      .max(20, "Maximum 20 characters"),
    dob: Yup.date()
      .required("Date of Birth is required")
      .test("age", "You must be at least 18 years old", function (value) {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 18;
      }),
    pan: Yup.string()
      .required("PAN is required")
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
    aadhar: Yup.string()
      .required("Aadhar is required")
      .matches(/^\d{4}\s\d{4}\s\d{4}$/, "Invalid Aadhar format"),
    gstin: Yup.string()
      .required("GSTIN is required")
      .matches(
        /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/,
        "Invalid GSTIN format"
      ),
    udyam: Yup.string()
      .required("UDYAM is required")
      .matches(/^UDYAM-[A-Z]{2}-00-\d{7}$/, "Invalid UDYAM format"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const navigate = useNavigate();

  const onSubmit = (data) => {

    const name = `${data.firstName} ${data.lastName}`;

    const dob = new Date(data.dob).toISOString().split("T")[0];

    // data for backend
    const postData = {
      name,
      dob,
      pan: data.pan,
      aadhar: data.aadhar,
      gstin: data.gstin,
      udyam: data.udyam,
    };

    console.log("Data to be sent:", postData);

    axios
      .post("http://localhost:8000/api/user", postData)
      .then((response) => {
        console.log(response.data);
        // Navigate to the Loan Details page
        navigate("/loan-details");
      })
      .catch((error) => {
        console.error(error.response.data);
        alert(error.response.data.detail || "An error occurred");
      });
  };

  const formBackground = useColorModeValue("white", "gray.700");
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      minHeight="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.800")}
      padding={4}
    >
      {/* Dark Mode Toggle Button */}
      <IconButton
        position="absolute"
        top={4}
        right={4}
        icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        isRound
        size="lg"
        onClick={toggleColorMode}
        aria-label="Toggle dark mode"
      />

      <MotionBox
        bg={formBackground}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        width={{ base: "100%", md: "80%", lg: "50%" }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Onboarding Form
        </Heading>
        <Divider mb={6} />

        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4} align="stretch">
            {/* Name Fields */}
            <HStack spacing={4} align="flex-start" flexWrap="wrap">
              <FormControl id="firstName" isInvalid={errors.firstName}>
                <FormLabel>First Name</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaUser color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Enter your first name"
                    {...register("firstName")}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl id="lastName" isInvalid={errors.lastName}>
                <FormLabel>Last Name</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaUser color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Enter your last name"
                    {...register("lastName")}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
              </FormControl>
            </HStack>

            {/* Date of Birth Field */}
            <FormControl id="dob" isInvalid={errors.dob}>
              <FormLabel>Date of Birth</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <CalendarIcon color="gray.300" />
                </InputLeftElement>
                <Input type="date" {...register("dob")} />
              </InputGroup>
              <FormErrorMessage>{errors.dob?.message}</FormErrorMessage>
            </FormControl>

            {/* PAN Field */}
            <FormControl id="pan" isInvalid={errors.pan}>
              <FormLabel>PAN</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaIdCard color="gray.300" />
                </InputLeftElement>
                <Input placeholder="ABCDE1234F" {...register("pan")} />
              </InputGroup>
              <FormErrorMessage>{errors.pan?.message}</FormErrorMessage>
            </FormControl>

            {/* Aadhar Field */}
            <FormControl id="aadhar" isInvalid={errors.aadhar}>
              <FormLabel>Aadhar</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <InfoIcon color="gray.300" />
                </InputLeftElement>
                <Input placeholder="1234 5678 9123" {...register("aadhar")} />
              </InputGroup>
              <FormErrorMessage>{errors.aadhar?.message}</FormErrorMessage>
            </FormControl>

            {/* GSTIN Field */}
            <FormControl id="gstin" isInvalid={errors.gstin}>
              <FormLabel>GSTIN</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <InfoOutlineIcon color="gray.300" />
                </InputLeftElement>
                <Input placeholder="12ABCDE1234F1Z5" {...register("gstin")} />
              </InputGroup>
              <FormErrorMessage>{errors.gstin?.message}</FormErrorMessage>
            </FormControl>

            {/* UDYAM Field */}
            <FormControl id="udyam" isInvalid={errors.udyam}>
              <FormLabel>UDYAM</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="UDYAM-XX-00-0000000"
                  {...register("udyam")}
                />
              </InputGroup>
              <FormErrorMessage>{errors.udyam?.message}</FormErrorMessage>
            </FormControl>

            {/* Submit Button */}
            <Button
              mt={4}
              colorScheme="teal"
              type="submit"
              size="lg"
              width="full"
              _hover={{ bg: "teal.600" }}
              _active={{ transform: "scale(0.98)" }}
            >
              Submit
            </Button>
          </VStack>
        </Box>
      </MotionBox>
    </Flex>
  );
};

export default Onboarding;
