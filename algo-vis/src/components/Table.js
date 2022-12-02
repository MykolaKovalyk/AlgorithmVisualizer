import { useEffect, useRef, useState } from "react"
import useStateRef from "react-usestateref"
import styles from "./Table.module.css"



export default function Table({ getInterface, ...props }) {
    let tableRef = useRef()
    let table = useRef([[null, null],])
    let [update, setUpdate, updateRef] = useStateRef(false)
    let focus = useRef()

    useEffect(() => {
        getInterface?.({
            setData: (data) => {
                table.current = data;
                setUpdate(!updateRef.current)
            },
            getData: () => table.current
        })
    }, [])



    function modifyTableEntry(event, key, data) {
        if (!data) return

        focus.current = null
        let source = parseInt(data.source.value);
        if (isNaN(source)) {
            source = null
        }


        let target = parseInt(data.target.value)
        if (isNaN(target)) {
            target = null

        }


        table.current[key] = [
            source,
            target
        ]


        console.log(table.current[key])


        setUpdate(!update)
    }

    function addOrRemoveEntry(event, key, data) {
        if (event.key === "Enter") {
            let splitIndex = event.target.selectionEnd


            table.current.splice(key, 0, [null, null]);
            if (event.target === data.source) {
                let preCursorString = parseInt(table.current[key + 1][0]?.toString().substring(0, splitIndex))
                let postCursorString = parseInt(table.current[key + 1][0]?.toString().substring(splitIndex))

                table.current[key][0] = isNaN(preCursorString) ? null : preCursorString
                table.current[key + 1][0] = isNaN(postCursorString) ? null : postCursorString

                let temp = table.current[key + 1][1]
                table.current[key + 1][1] = table.current[key][1]
                table.current[key][1] = temp
            } else if (event.target === data.target) {
                let preCursorString = parseInt(table.current[key + 1][1]?.toString().substring(0, splitIndex + 1))
                let postCursorString = parseInt(table.current[key + 1][1]?.toString().substring(splitIndex + 1))

                table.current[key][1] = isNaN(preCursorString) ? null : preCursorString
                table.current[key + 1][1] = isNaN(postCursorString) ? null : postCursorString

                let temp = table.current[key + 1][0]
                table.current[key + 1][0] = table.current[key][0]
                table.current[key][0] = temp
            }

            focus.current = key + 1
            setUpdate(!update)
        } else if (event.key === "Backspace") {
            if (event.target.selectionEnd !== 0) return;
            if (table.current.length < 2) return;

            event.preventDefault()

            table.current[key][0] = parseInt(
                [
                    table.current[key - 1][0]?.toString(),
                    table.current[key][0]?.toString()
                ].join(''))
            table.current[key][1] = parseInt(
                [
                    table.current[key - 1][1]?.toString(),
                    table.current[key][1]?.toString()
                ].join(''))

            if (isNaN(table.current[key][0])) {
                table.current[key][0] = null
            }

            if (isNaN(table.current[key][1])) {
                table.current[key][1] = null
            }

            table.current = table.current.filter((element, index) => index !== key - 1)
            focus.current = key - 1

            setUpdate(!update)
        } else if (event.key === "ArrowDown") {
            focus.current = key + 1
            setUpdate(!update)
        } else if (event.key === "ArrowUp") {
            focus.current = key - 1
            setUpdate(!update)
        }
    }


    return <table ref={tableRef} {...props}>
        <tbody >
            {table.current.map((item, index) =>
                <TableItem
                    key={index}
                    yIndex={index}
                    data={{ source: item[0], target: item[1] }}
                    focus={focus}
                    modifyTableEntry={modifyTableEntry}
                    addOrRemoveEntry={addOrRemoveEntry}
                />)}
        </tbody>
    </table>
}



export function TableItem({ data, yIndex, modifyTableEntry, addOrRemoveEntry, focus, ...props }) {
    const sourceInput = useRef()
    const targetInput = useRef()
    const dataInputs = useRef()

    useEffect(() => {
        sourceInput.current.value = data.source
        targetInput.current.value = data.target
        if (focus.current === yIndex) {
            sourceInput.current.focus()
        }
        dataInputs.current = {
            source: sourceInput.current,
            target: targetInput.current
        }
    })

    return <tr key={yIndex} className={styles.table_entry} {...props}>
        <th className={styles.source}>
            <input ref={sourceInput} className={styles.source_input} type="text"
                onChange={event => modifyTableEntry(event, yIndex, dataInputs.current)}
                onKeyDown={event => addOrRemoveEntry(event, yIndex, dataInputs.current)}
            />
        </th>
        <th className={styles.target}>
            <input ref={targetInput} className={styles.target_input} type="text"
                onChange={event => modifyTableEntry(event, yIndex, dataInputs.current)}
                onKeyDown={event => addOrRemoveEntry(event, yIndex, dataInputs.current)}
            />
        </th>
    </tr>
}