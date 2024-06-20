import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
} from "material-react-table";
import {
  Box,
  ListItemIcon,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Edit, Visibility, Delete, Add } from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: {
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

export type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  salary: number;
  startDate: string;
  signatureCatchPhrase: string;
  avatar: string;
};

const Table = () => {
  const [data, setData] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "edit" | "view" | "delete" | "add" | null
  >(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get("http://localhost:3001/employees");
        setData(result.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleOpenDialog = (
    type: "edit" | "view" | "delete" | "add",
    employee: Employee | null = null
  ) => {
    setSelectedEmployee(employee);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmployee(null);
    setDialogType(null);
  };

  const handleSaveEdit = async () => {
    try {
      if (dialogType === "add") {
        const response = await axios.post(
          "http://localhost:3001/employees",
          selectedEmployee
        );
        setData((prevData) => [...prevData, response.data]);
      } else if (dialogType === "edit") {
        await axios.put(
          `http://localhost:3001/employees/${selectedEmployee!.id}`,
          selectedEmployee
        );
        setData((prevData) =>
          prevData.map((emp) =>
            emp.id === selectedEmployee!.id ? selectedEmployee! : emp
          )
        );
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3001/employees/${selectedEmployee!.id}`
      );
      setData((prevData) =>
        prevData.filter((emp) => emp.id !== selectedEmployee!.id)
      );
      setDialogOpen(false);
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Employee>[]>(
    () => [
      {
        id: "employee",
        header: "",
        columns: [
          {
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            id: "name",
            header: "Name",
            size: 250,
            enableColumnFilter: false,
            Cell: ({ renderedCellValue }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
        ],
      },
      {
        id: "id",
        header: "",
        columns: [
          {
            accessorKey: "salary",
            filterFn: "between",
            header: "Salary",
            size: 200,
            enableColumnFilter: false,
            Cell: ({ cell }) => (
              <Box
                component="span"
                sx={(theme) => ({
                  backgroundColor:
                    cell.getValue<number>() < 50000
                      ? theme.palette.error.dark
                      : cell.getValue<number>() >= 50000 &&
                        cell.getValue<number>() < 75000
                      ? theme.palette.warning.dark
                      : theme.palette.success.dark,
                  borderRadius: "0.30rem",
                  color: "#fff",
                  maxWidth: "9ch",
                  p: "0.25rem",
                  boxShadow: 3,
                })}
              >
                {cell.getValue<number>()?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Box>
            ),
          },
          {
            accessorFn: (row) => new Date(row.startDate),
            id: "startDate",
            header: "Start Date",
            sortingFn: "datetime",
            enableColumnFilter: false,
            Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
            Header: ({ column }) => <em>{column.columnDef.header}</em>,
            muiFilterTextFieldProps: {
              sx: {
                minWidth: "250px",
              },
            },
          },
        ],
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: false,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      columnPinning: {
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
      },
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
    renderRowActionMenuItems: ({ row }) => [
      <MenuItem
        key={0}
        onClick={() => handleOpenDialog("edit", row.original)}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Edit />
        </ListItemIcon>
        Edit
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => handleOpenDialog("view", row.original)}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Visibility />
        </ListItemIcon>
        View
      </MenuItem>,
      <MenuItem
        key={2}
        onClick={() => handleOpenDialog("delete", row.original)}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Delete />
        </ListItemIcon>
        Delete
      </MenuItem>,
    ],
    renderTopToolbar: ({ table }) => {
      const handleAddUser = () => {
        handleOpenDialog("add", {
          id: 0,
          firstName: "",
          lastName: "",
          email: "",
          jobTitle: "",
          salary: 0,
          startDate: "",
          signatureCatchPhrase: "",
          avatar: "",
        });
      };

      return (
        <Box
          sx={() => ({
            backgroundColor: theme.palette.primary.main,
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}
        >
          <Box
            sx={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              borderRadius: 1,
            }}
          >
            <MRT_GlobalFilterTextField
              table={table}
              style={{
                padding: 2,
                backgroundColor: "whitesmoke",
                borderRadius: 4,
              }}
            />
          </Box>
          <Box>
            <IconButton onClick={handleAddUser} style={{ color: "whitesmoke" }}>
              <Add />
            </IconButton>
          </Box>
        </Box>
      );
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === "edit"
            ? "Edit Employee"
            : dialogType === "view"
            ? "View Employee"
            : dialogType === "delete"
            ? "Delete Employee"
            : "Add Employee"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "edit" ||
          dialogType === "view" ||
          dialogType === "add" ? (
            <>
              <TextField
                fullWidth
                margin="dense"
                label="First Name"
                defaultValue={selectedEmployee?.firstName}
                onChange={(e) =>
                  setSelectedEmployee((prev) => ({
                    ...prev!,
                    firstName: e.target.value,
                  }))
                }
                InputProps={{
                  readOnly: dialogType === "view",
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Last Name"
                defaultValue={selectedEmployee?.lastName}
                onChange={(e) =>
                  setSelectedEmployee((prev) => ({
                    ...prev!,
                    lastName: e.target.value,
                  }))
                }
                InputProps={{
                  readOnly: dialogType === "view",
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Email"
                defaultValue={selectedEmployee?.email}
                onChange={(e) =>
                  setSelectedEmployee((prev) => ({
                    ...prev!,
                    email: e.target.value,
                  }))
                }
                InputProps={{
                  readOnly: dialogType === "view",
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Job Title"
                defaultValue={selectedEmployee?.jobTitle}
                onChange={(e) =>
                  setSelectedEmployee((prev) => ({
                    ...prev!,
                    jobTitle: e.target.value,
                  }))
                }
                InputProps={{
                  readOnly: dialogType === "view",
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Salary"
                defaultValue={selectedEmployee?.salary}
                onChange={(e) =>
                  setSelectedEmployee((prev) => ({
                    ...prev!,
                    salary: parseFloat(e.target.value),
                  }))
                }
                InputProps={{
                  readOnly: dialogType === "view",
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Start Date"
                defaultValue={selectedEmployee?.startDate}
                onChange={(e) =>
                  setSelectedEmployee((prev) => ({
                    ...prev!,
                    startDate: e.target.value,
                  }))
                }
                InputProps={{
                  readOnly: dialogType === "view",
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Signature Catch Phrase"
                defaultValue={selectedEmployee?.signatureCatchPhrase}
                onChange={(e) =>
                  setSelectedEmployee((prev) => ({
                    ...prev!,
                    signatureCatchPhrase: e.target.value,
                  }))
                }
                InputProps={{
                  readOnly: dialogType === "view",
                }}
                variant="outlined"
              />
            </>
          ) : (
            <Box>Are you sure you want to delete this employee?</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          {dialogType === "edit" || dialogType === "add" ? (
            <Button onClick={handleSaveEdit} color="primary">
              Save
            </Button>
          ) : dialogType === "delete" ? (
            <Button onClick={handleConfirmDelete} color="secondary">
              Delete
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
};

const AdvanceTable = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Table />
    </LocalizationProvider>
  </ThemeProvider>
);

export default AdvanceTable;
