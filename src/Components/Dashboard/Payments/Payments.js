import { useContext, useEffect, useState } from "react";
import jwtInterceptor from "../../../Utilities/Interceptors/jwtInterceptor";
import AuthContext from "../../Auth Context/AuthContext";
import DataTable from "../../../Utilities/Data Table/Data-table";
import moment from "moment";
import { LineChart } from "../../../Utilities/Charts/Charts";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";

function Payments(props) {
    const { user } = useContext(AuthContext); //user is the logged in userSS

    const theme = useTheme();

    const [payments, setPayments] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [renderingRevenueData, setRenderingRevenueData] = useState([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]); //used to render the green curve, 12 months

    const [expensesData, setExpensesData] = useState([]);
    const [renderingExpensesData, setRenderingExpensesData] = useState([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]); //used to render the red curve, 12 months

    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const [allTransactions, setAllTransactions] = useState([]); //za renderovanje tabele kod zaposlenih

    const api_url = process.env.REACT_APP_API_URL;


    const renderingArr = user.isClient === 1 ? payments : allTransactions; //ako je korisnik ulogovan, onda samo vidi njegove transakcije, ako je zaposleni, onda vidi sve transakcije
    const rows = renderingArr.map((transaction, index) => {
        //koristi se za renderovanje tabele transakcija
        console.log("transaction", transaction);
        return {
            id: index + 1, //need to have 'id'
            Date: moment(transaction.Date).format("DD-MMM-YYYY HH:mm:ss") + 'h',
            Amount: transaction.Amount + "€",
            Type: transaction.Type,
            Description: transaction.Description,
            // Description: ``
            //PRONAĆI U props.memberships,
        };
    });

    const cols = [
        { field: "id", headerName: "Br.", width: 100 },
        { field: "Amount", headerName: "Iznos", width: 120 },
        { field: "Date", headerName: "Datum i vrijeme", width: 200 },
        { field: "Type", headerName: "Vrsta", width: 200 },
        { field: "Description", headerName: "Opis", width: 450 },
    ];

    useEffect(() => {
        //fetch payments from the server
        console.log("Fetching the clients' transactions...", user.ID);

        // const clientEmployee = user.isClient === 1 ? "client" : "employee"; //if user has FK_ClientID, then he is a client, otherwise he is an employee
        jwtInterceptor
            .get(`${api_url}/transaction/client/${user.ID}`, {withCredentials: true})
            .then((res) => {
                setPayments(res.data);
                console.log("Successfully fetched clients' transactions!", res.data);
               
            })
            .catch((err) => {
                console.log("Error while trying to get clients' transactions!", err);
            });
    }, [props.isAgree, props.memBought]); //isAgree is a state is activated when the user renews his membership

    useEffect(() => {
        //fetches monthly revenue
        jwtInterceptor
            .get(`${api_url}/transaction/revenue/1`, { withCredentials: true }) //1 is FK_TransactionTypesID for membership renewal
            .then((res) => {
                console.log("Successfully fetched monthly revenue", res.data);
                setRevenueData(res.data);
            })
            .catch((err) => {
                console.log("Error while fetching monthly revenue", err);
            });

        jwtInterceptor
            .get(`${api_url}/transaction/expenses`, { withCredentials: true })
            .then((res) => {
                console.log("Successfully fetched expenses!", res.data);
                setExpensesData(res.data);
                console.log("EXPENSES DATA", expensesData);
            })
            .catch((err) => {
                console.log("Error while fetching expenses", err);
            });
    }, []);

    useEffect(() => {
        // dovlači se sve transakcije, (i prihodi i rashodi) za renderovanje tabele kod zaposlenih
        if(user.isClient === 1) return; //ako je klijent, ne treba da dovlači sve transakcije 

        jwtInterceptor.get(`${api_url}/transaction/all`, { withCredentials: true })
            .then((res) => {
                console.log("Successfully fetched all transactions!", res.data);
                setAllTransactions(res.data);   
            })
            .catch((err) => {
                console.log("Error while fetching all transactions!", err);
            });
    }, []);

    //podaci za X osu grafika prihoda i rashoda
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];

    useEffect(() => {
        fillRenderingRevenueData(); //popunjava rendering data sa 0 ako nema podataka za taj mjesec, ili sa prihodom, ako postoji
        fillRenderingExpensesData(); //popunjava rendering data sa 0 ako nema podataka za taj mjesec, ili sa rashodom, ako postoji
    }, [revenueData]);

    function fillRenderingRevenueData() {
        //ovo se koristi za prikaz na Y osi
        setTotalRevenue(0); //resets the total revenue because of the useEffect re-rendering

        let tempRevArr = [...renderingRevenueData];

        revenueData.forEach((revenue) => {
            //sets the revenue for the month
            tempRevArr[revenue.Month - 1] = revenue.Revenue; //tempArr contains revenue for each month (if there is no revenue, it is 0)
            setTotalRevenue((prev) => prev + revenue.Revenue);
        });
        setRenderingRevenueData(tempRevArr); //sets revenue data for the chart
    }

    function fillRenderingExpensesData() {
        setTotalExpenses(0); //resets the total expenses because of the useEffect re-rendering

        let tempExpArr = [...renderingExpensesData];

        expensesData.forEach((expense) => {
            //sets the expenses for the month
            tempExpArr[expense.Month - 1] = expense.Expenses; //tempArr contains expenses for each month (if there is no expense, it is 0)
            setTotalExpenses((prev) => prev + expense.Expenses);
        });
        setRenderingExpensesData(tempExpArr); //sets expenses data for the chart
    }
    const LineChartData = {
        labels: months, //X axis, rendering months array
        datasets: [
            {
                label: "Mjesečni prihodi (€)",
                data: renderingRevenueData, //Y axis, rendering

                fill: {
                    target: "origin",
                    above: "rgba(75, 180, 140, 0.2)", // Area will be red above the origin
                    below: "rgba(75, 180, 140, 0.2)", // And blue below the origin
                },
                borderColor: "rgb(75, 192, 192)",
                tension: 0.15, //line curve (0 is straight line)
            },
            {
                label: "Mjesečni rashodi (€)",
                data: renderingExpensesData, //Y axis, rendering

                fill: {
                    target: "origin",
                    above: "rgba(200, 100, 140, 0.2)", // Area will be red above the origin
                    below: "rgba(200, 100, 140, 0.2)", // And blue below the origin
                },
                borderColor: "rgba(240, 50, 102, 0.7)",
                tension: 0.15, //line curve (0 is straight line)
            },
        ],
    };

    const LineChartOptions = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <>
        {(user.isAdmin === 1 || user.isEmployee) && (
            <Box sx={{border: '1px solid #E0E0E0', borderRadius: '10px',
                     boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)', mt: 5,
                        p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'
                     }}>
                {/* Grafik za plaćanja se renderuje jedino za zaposlene i admina */}
                    <>
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <Typography sx={{...theme.title, mt: 4, mb: 4}}>
                                Plaćanja
                            </Typography>

                            <Typography sx={{fontSize: 18, color: theme.palette.primaryGreen.main }}>
                                Ovogodišnji prihodi i rashodi
                            </Typography>

                            <Box sx={{width: '60vw', height: '60vh', ml: 10}}>
                                <LineChart data={LineChartData} options={LineChartOptions} />
                            </Box>
                        </Box>

                    
                        <Box className="money-statistics">
                            <Box className="money-statistics-revenue">
                                <h3 style={{color: '#637381'}}>Ukupni godišnji prihodi</h3>
                                <h4 style={{color: '#637381', textAlign: 'center'}}>{totalRevenue}€</h4>
                            </Box>
                            <Box className="money-statistics-expenses">
                                <h3 style={{color: '#637381'}}>Ukupni godišnji rashodi</h3>
                                <h4 style={{color: '#637381', textAlign: 'center'}}>{totalExpenses}€</h4>
                            </Box>
                        </Box>
                    </>
            </Box>
        )}

            {/* Transakcije */}
            {(payments || allTransactions) && (
                <Box sx={{mt:4}}>
                    <Typography sx={{...theme.title, mb: 4}}>Transakcije</Typography>
                   
                    <Box>
                        <Box className="transaction">
                            <DataTable rows={rows} columns={cols} />
                        </Box>
                    </Box>     
                </Box>
            )}
        </>
    );
}

export default Payments;
