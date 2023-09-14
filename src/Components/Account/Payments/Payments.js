import { useContext, useEffect, useState } from "react";
import "./Payments.css";
import jwtInterceptor from "../../../Utilities/Interceptors/jwtInterceptor";
import AuthContext from "../../Auth Context/AuthContext";
import DataTable from "../../../Utilities/Data Table/Data-table";
import moment from "moment";
import { LineChart } from "../../../Utilities/Charts/Charts";
import dotenv from 'dotenv';
dotenv.config();

function Payments(props) {
    const { user } = useContext(AuthContext); //user is the logged in userSS

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

    const api_url = process.env.REACT_APP_API_URL;

    const findMembership = (FK_ClientID, startDate) => {
        //returns membership details
        //NAPRAVITI OVO DA SE DATUMI PODUDARAJU SA MEMBERSHIPOM IZ BAZE I OVIM STO SE GENERISE PRILIKOM KREIRANJA TRANSAKCIJE
        const membershipData = props.memberships.find((mem) => {
            return mem.FK_ClientID === FK_ClientID && mem["StartDate"] === startDate;
        });
        return membershipData;
    };

    const rows = payments.map((transaction, index) => {
        console.log("transaction", transaction);
        return {
            id: index + 1, //need to have 'id'
            Date: moment(transaction.Date).format("DD-MM-YYYY HH:mm:ss"),
            Amount: transaction.Amount + "€",
            Type: transaction.Type,
            // Description: ``
            //PRONAĆI U props.memberships,
        };
    });

    const cols = [
        { field: "id", headerName: "No.", width: 100 },
        { field: "Date", headerName: "Date and Time", width: 200 },
        { field: "Amount", headerName: "Amount", width: 200 },
        { field: "Type", headerName: "Type", width: 200 },
        { field: "Description", headerName: "Description", width: 200 },
    ];

    useEffect(() => {
        //fetch payments from the server
        console.log("Fetching all the transactions...", user.ID);
        //OVO PROMIJENITI DA DOVLAČI IZ COOKIEA, (AKO JE EMPLYOEE ILI CLIENT)
        //DODATI USLOV AKO JE EMPLOYEE, onda gađi employee/transaction, ako je client onda client/transaction

        const clientEmployee = user.FK_ClientID ? "client" : "employee"; //if user has FK_ClientID, then he is a client, otherwise he is an employee
        jwtInterceptor
            .get(`${api_url}/transaction/${clientEmployee}/${user.ID}`, {
                withCredentials: true,
            })
            // .get(`${api_url}/transaction/employee/${user.ID}`, {
            //     withCredentials: true,
            // })
            .then((res) => {
                setPayments(res.data);
                console.log("Successfully fetched all the transactions!", res.data);
                console.log("FIND MEM DATA", findMembership(1178, "2023-07-27 18:21:31.0000000"));
                console.log(
                    "ISTO?",
                    moment("27-07-2023 18:21:38").isSame("2023-07-27T18:21:38.000Z")
                );
            })
            .catch((err) => {
                console.log("Error while trying to get all the transactions!", err);
            });
    }, [props.isAgree]); //isAgree is a state is activated when the user renews his membership

    useEffect(() => {
        //fetches monthly revenue
        //DODATI YEAR UNUTAR BODY-a (moguće da će morati da se radi preko posta, a ne geta)
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

    //line chart data for X axis
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    useEffect(() => {
        fillRenderingRevenueData(); //fills the rendering data with 0 if there is no data for that month, or with the revenue if it exists
        fillRenderingExpensesData(); //fills the rendering data with 0 if there is no data for that month, or with the expense if it exists
    }, [revenueData]);

    function fillRenderingRevenueData() {
        //this data will be displayed on Y axis
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
                label: "Monthly Revenue",
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
                label: "Monthly Expenses",
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
        <div className="payments-container">
            <div className="payments-title">
                <h2>Payments</h2>
            </div>

            <div className="line-chart">
                <h2>Dodati da se bira godina (po defaultu ide trenutna)</h2>
                <LineChart data={LineChartData} options={LineChartOptions} />
            </div>

            <div className="money-statistics">
                <div className="money-statistics-revenue">
                    <h3>Total Yearly Revenue</h3>
                    <h4>{totalRevenue}€</h4>
                </div>
                <div className="money-statistics-expenses">
                    <h3>Total Yearly Expenses</h3>
                    <h4>{totalExpenses}€</h4>
                </div>
            </div>

            {payments && (
                <div className="payments-content">
                    <div className="transaction">
                        <DataTable rows={rows} columns={cols} />
                    </div>
                </div>
            )}
            
            <h4>
                Dodati grafik za prihode i rashode i popraviti podatke u cijeloj bazi, jer su u
                disbalansu
            </h4>
        </div>
    );
}

export default Payments;
