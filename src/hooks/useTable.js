import { useState, useEffect } from "react";

const useTable = (data, page, rowsPerPage) => {

    const [tableRange, setTableRange] = useState([]);
    const [slice, setSlice] = useState([]);

    useEffect(() => {
        const range = calculateRange(data, rowsPerPage);
        setTableRange([...range]);

        const slice = sliceData(data, page, rowsPerPage);
        setSlice([...slice]);
    }, [data, setTableRange, page, setSlice]);

    const calculateRange = (data, rowsPerPage) => {
        const range = [];
        const num = Math.ceil(data.length / rowsPerPage);
        let i = 1;
        for (let i = 1; i <= num; i++) {
            range.push(i);
        }
        return range;
    };

    const sliceData = (data, page, rowsPerPage) => {
        return data.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    };
    return { slice, range: tableRange };
};

export default useTable;