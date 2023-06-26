import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";

export default function DataTable(props) {
    return (
        <div style={{ height: 500, width: "100%" }}>
            <DataGrid
                rows={props.rows}
                columns={props.columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                pagination
                checkboxSelection
            />
        </div>
    );
}
