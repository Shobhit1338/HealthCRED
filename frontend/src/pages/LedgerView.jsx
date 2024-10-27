import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { SunIcon, MoonIcon, DownloadIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

const LedgerView = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { state } = useLocation();
  const loanId = state?.loanId;

  // State variables
  const [loanData, setLoanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch loan data
  useEffect(() => {
    if (loanId) {
      axios
        .get(`http://localhost:8000/api/ledger`, { params: { loan_id: loanId } })
        .then((response) => {
          setLoanData(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error.response?.data || error.message);
          setIsLoading(false);
          alert(error.response?.data?.detail || "An error occurred while fetching ledger data.");
        });
    } else {
      // loanId is not provided
      setIsLoading(false);
      alert("Loan ID not provided.");
    }
  }, [loanId]);

  if (isLoading) {
    return (
      <Flex minHeight="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!loanData) {
    return (
      <Flex minHeight="100vh" align="center" justify="center">
        <Heading>Loan not found</Heading>
      </Flex>
    );
  }

  // Extract data from loanData
  const { loan_details, emi, repayment_schedule } = loanData;

  // repayment_schedule is sorted
  repayment_schedule.sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

  // Calculate next EMI date and outstanding principal
  const today = new Date();
  let nextEMI = null;
  let outstandingPrincipal = loan_details.loan_amount;

  for (let entry of repayment_schedule) {
    const paymentDate = new Date(entry.payment_date);
    if (paymentDate >= today) {
      nextEMI = entry;
      break;
    } else {
      outstandingPrincipal = entry.outstanding_principal;
    }
  }

  if (!nextEMI) {
    outstandingPrincipal = 0;
  }

  const downloadCSV = () => {
    // Make a GET request to the CSV endpoint
    axios
      .get("http://localhost:8000/api/ledger/csv", {
        params: { loan_id: loanId },
        responseType: "blob",
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "text/csv" });
        const link = document.createElement("a");
        // Set the URL and filename
        link.href = window.URL.createObjectURL(blob);
        link.download = `ledger_${loanId}.csv`;
        // trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error(error.response?.data || error.message);
        alert("An error occurred while downloading the CSV file.");
      });
  };

  return (
    <Box p={8}>
      {/* Dark Mode Toggle */}
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

      <Heading mb={6}>Loan Ledger</Heading>

      {nextEMI ? (
        <Box mb={4}>
          <Heading size="md">Next EMI Date: {nextEMI.payment_date}</Heading>
        </Box>
      ) : (
        <Box mb={4}>
          <Heading size="md">All payments have been made.</Heading>
        </Box>
      )}

      <Box mb={4}>
        <Heading size="md">Outstanding Principal: {outstandingPrincipal.toFixed(2)}</Heading>
      </Box>

      <Button
        leftIcon={<DownloadIcon />}
        colorScheme="teal"
        variant="solid"
        mb={4}
        onClick={downloadCSV}
      >
        Download Ledger as CSV
      </Button>

      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Payment Date</Th>
            <Th>Principal Component</Th>
            <Th>Interest Component</Th>
            <Th>Total Payment</Th>
            <Th>Outstanding Principal</Th>
          </Tr>
        </Thead>
        <Tbody>
          {repayment_schedule.map((entry, index) => (
            <Tr key={index}>
              <Td>{entry.payment_date}</Td>
              <Td>{entry.principal_component.toFixed(2)}</Td>
              <Td>{entry.interest_component.toFixed(2)}</Td>
              <Td>{entry.total_payment.toFixed(2)}</Td>
              <Td>{entry.outstanding_principal.toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default LedgerView;
