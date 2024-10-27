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
  Divider,
  useColorModeValue,
  useColorMode,
  IconButton,
  InputGroup,
  InputLeftElement,
  HStack,
  chakra,
  shouldForwardProp,
} from "@chakra-ui/react";
import {
  SunIcon,
  MoonIcon,
  CalendarIcon,
  AddIcon,
  MinusIcon,
} from "@chakra-ui/icons";
import {
  FaMoneyBillWave,
  FaPercentage,
  FaCalendarAlt,
} from "react-icons/fa";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, isValidMotionProp } from "framer-motion";

const MotionBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

const LoanDetails = () => {
  // Validation schema
  const validationSchema = Yup.object().shape({
    disbursement_date: Yup.date()
      .required("Disbursement Date is required")
      .min(
        new Date().toISOString().split("T")[0],
        "Disbursement Date cannot be in the past"
      ),
    loan_amount: Yup.number()
      .typeError("Loan Amount must be a number")
      .required("Loan Amount is required")
      .positive("Loan Amount must be positive"),
    interest_rate: Yup.number()
      .typeError("Interest Rate must be a number")
      .required("Interest Rate is required")
      .positive("Interest Rate must be positive"),
    tenure: Yup.number()
      .typeError("Tenure must be a number")
      .required("Tenure is required")
      .positive("Tenure must be positive")
      .integer("Tenure must be an integer"),
    repayment_dates: Yup.array()
      .of(
        Yup.object().shape({
          date: Yup.date().required("Repayment date is required"),
        })
      )
      .min(1, "At least one repayment date is required"),
  })
    .test(
      "dates-after-disbursement",
      "All repayment dates must be after Disbursement Date",
      function (values) {
        const { disbursement_date, repayment_dates } = values;
        if (!disbursement_date || !repayment_dates) {
          return true;
        }

        const disbursementDate = new Date(disbursement_date);
        disbursementDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < repayment_dates.length; i++) {
          const repaymentDate = new Date(repayment_dates[i].date);
          repaymentDate.setHours(0, 0, 0, 0);
          if (repaymentDate <= disbursementDate) {
            return this.createError({
              path: `repayment_dates.${i}.date`,
              message: "Repayment date must be after Disbursement Date",
            });
          }
        }
        return true;
      }
    )
    .test(
      "match-tenure",
      "Number of repayment dates must match the tenure",
      function (values) {
        const { tenure, repayment_dates } = values;
        if (!tenure || !repayment_dates) {
          return true;
        }
        return repayment_dates.length === parseInt(tenure);
      }
    );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      repayment_dates: [{ date: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "repayment_dates",
  });

  const navigate = useNavigate();

  const onSubmit = (data) => {
    // Format disbursement_date
    const disbursement_date = new Date(data.disbursement_date)
      .toISOString()
      .split("T")[0];

    // Format repayment_dates
    const repayment_dates = data.repayment_dates.map((item) =>
      new Date(item.date).toISOString().split("T")[0]
    );

    // data for backend
    const postData = {
      disbursement_date,
      loan_amount: parseFloat(data.loan_amount),
      interest_rate: parseFloat(data.interest_rate),
      tenure: parseInt(data.tenure),
      repayment_dates,
    };

    console.log("Data to be sent:", postData);

    axios
      .post("http://localhost:8000/api/loan", postData)
      .then((response) => {
        console.log(response.data);
        // Navigate to the Ledger View page, passing the loanId
        navigate("/ledger-view", {
          state: { loanId: response.data.loan_id },
        });
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
          Loan Details Form
        </Heading>
        <Divider mb={6} />

        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4} align="stretch">
            {/* Disbursement Date Field */}
            <FormControl
              id="disbursement_date"
              isInvalid={errors.disbursement_date}
            >
              <FormLabel>Disbursement Date</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <CalendarIcon color="gray.300" />
                </InputLeftElement>
                <Input type="date" {...register("disbursement_date")} />
              </InputGroup>
              <FormErrorMessage>
                {errors.disbursement_date?.message}
              </FormErrorMessage>
            </FormControl>

            {/* Loan Amount Field */}
            <FormControl id="loan_amount" isInvalid={errors.loan_amount}>
              <FormLabel>Loan Amount</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaMoneyBillWave color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Enter Loan Amount"
                  {...register("loan_amount")}
                />
              </InputGroup>
              <FormErrorMessage>{errors.loan_amount?.message}</FormErrorMessage>
            </FormControl>

            {/* Interest Rate Field */}
            <FormControl id="interest_rate" isInvalid={errors.interest_rate}>
              <FormLabel>Interest Rate (% per annum)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaPercentage color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Enter Interest Rate"
                  {...register("interest_rate")}
                />
              </InputGroup>
              <FormErrorMessage>
                {errors.interest_rate?.message}
              </FormErrorMessage>
            </FormControl>

            {/* Tenure Field */}
            <FormControl id="tenure" isInvalid={errors.tenure}>
              <FormLabel>Tenure (in months)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaCalendarAlt color="gray.300" />
                </InputLeftElement>
                <Input placeholder="Enter Tenure" {...register("tenure")} />
              </InputGroup>
              <FormErrorMessage>{errors.tenure?.message}</FormErrorMessage>
            </FormControl>

            {/* Repayment Dates Field */}
            <FormControl isInvalid={errors.repayment_dates}>
              <FormLabel>Repayment Dates</FormLabel>
              {fields.map((field, index) => (
                <FormControl
                  key={field.id}
                  isInvalid={errors.repayment_dates?.[index]?.date}
                >
                  <HStack alignItems="flex-start">
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.300" />
                      </InputLeftElement>
                      <Input
                        type="date"
                        {...register(`repayment_dates.${index}.date`)}
                      />
                    </InputGroup>
                    <IconButton
                      icon={<MinusIcon />}
                      colorScheme="red"
                      onClick={() => remove(index)}
                      aria-label="Remove date"
                    />
                  </HStack>
                  <FormErrorMessage>
                    {errors.repayment_dates?.[index]?.date?.message}
                  </FormErrorMessage>
                </FormControl>
              ))}
              <Button
                leftIcon={<AddIcon />}
                colorScheme="teal"
                variant="outline"
                mt={2}
                onClick={() => append({ date: "" })}
              >
                Add Date
              </Button>
              <FormErrorMessage>
                {errors.repayment_dates?.message}
              </FormErrorMessage>
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

export default LoanDetails;
