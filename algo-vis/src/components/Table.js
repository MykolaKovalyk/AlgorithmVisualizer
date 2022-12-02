import { useEffect, useRef, useState } from "react"
import useStateRef from "react-usestateref"
import styles from "./Table.module.css"



export default function Table({getSetterAndGetter, ...props}) {
    let tableRef = useRef()
    let table = useRef()
    let [update, setUpdate, updateRef] = useStateRef(false)
    
    if(!table.current) {
        table.current = {
            entries: [[null, null],],
            focus: null
        }
        getSetterAndGetter?.(
            (data) => {
                table.current.entries = data;
                setUpdate(!updateRef.current)
            }
            , () => table.current.entries)
    }


    function modifyTable(event, key, data) {
        if(!data) return

        table.current.focus = null
        let source = parseInt(data.source.value);
        if(isNaN(source)){
            source = null
        }

        let target = parseInt(data.target.value)
        if(isNaN(target)){
            target = null
        }

        table.current.entries[key] = [
            source, 
            target
        ]

        setUpdate(!update)
    }

    function changeRowCount(event, key, data) {
        
        if(event.key === "Enter") {
            let splitIndex = event.target.selectionEnd


            table.current.entries.splice(key, 0, [null, null]);
            if(event.target === data.source) {
                let preCursorString = parseInt(table.current.entries[key + 1][0]?.toString().substring(0, splitIndex))
                let postCursorString = parseInt(table.current.entries[key + 1][0]?.toString().substring(splitIndex))

                table.current.entries[key][0] = isNaN(preCursorString) ? null : preCursorString
                table.current.entries[key + 1][0] = isNaN(postCursorString) ? null : postCursorString

                let temp = table.current.entries[key + 1][1]
                table.current.entries[key + 1][1] = table.current.entries[key][1]
                table.current.entries[key][1] =  temp
            } else if(event.target === data.target) {
                let preCursorString = parseInt(table.current.entries[key + 1][1]?.toString().substring(0, splitIndex + 1))
                let postCursorString = parseInt(table.current.entries[key + 1][1]?.toString().substring(splitIndex + 1))

                table.current.entries[key][1] = isNaN(preCursorString) ? null : preCursorString
                table.current.entries[key + 1][1] = isNaN(postCursorString) ? null : postCursorString
                
                let temp = table.current.entries[key + 1][0]
                table.current.entries[key + 1][0] = table.current.entries[key][0]
                table.current.entries[key][0] =  temp
            }

            table.current.focus = key + 1
            setUpdate(!update)
        } else if(event.key === "Backspace") {
            if(event.target.selectionEnd !== 0) return;
            if(table.current.entries.length < 2) return;
            
            event.preventDefault()
            
            table.current.entries[key][0] = parseInt(
                [
                    table.current.entries[key - 1][0]?.toString(),
                    table.current.entries[key][0]?.toString()
                ].join(''))
            table.current.entries[key][1] = parseInt(
                [
                    table.current.entries[key - 1][1]?.toString(),
                    table.current.entries[key][1]?.toString()
                ].join(''))

            if(isNaN(table.current.entries[key][0])) {
                table.current.entries[key][0] = null
            }

            if(isNaN(table.current.entries[key][1])) {
                table.current.entries[key][1] = null
            }

            table.current.entries = table.current.entries.filter((element, index) => index !== key - 1)
            table.current.focus = key - 1

            setUpdate(!update)
        } else if(event.key === "ArrowDown") {
            table.current.focus = key + 1
            setUpdate(!update)
        } else if(event.key === "ArrowUp") {
            table.current.focus = key - 1
            setUpdate(!update)
        }
    }


    return <div className={styles.table} {...props}>
        <table ref={tableRef} className={styles.table_container}>
            <tbody className={styles.table_inner_container}>
                {
                    table.current.entries.map((item, index) =>  
                        <TableItem 
                            key={index} 
                            yIndex={index} 
                            data={{source: item[0], target: item[1]}} 
                            focus={table.current.focus === index} 
                            modifyData={modifyTable} 
                            changeRowCount={changeRowCount}
                        />)
                }
            </tbody>
        </table>
    </div>
}



export function TableItem(props) {
    const sourceData = useRef()
    const targetData = useRef()

    let data = null

    useEffect(() => {
        sourceData.current.value = props.data.source
        targetData.current.value = props.data.target
        if(props.focus) {
            sourceData.current.focus()
            sourceData.current.selectionStart = sourceData.current.selectionEnd = props.focusPosition
        }
        data = {
            source: sourceData.current,
            target: targetData.current
        }
    })

    return <tr key={props.yIndex} style={props.style} className={styles.table_entry}>
                <th className={styles.source}>
                    <input ref={sourceData} className={styles.source_input} type="text" 
                        onChange={event => props.modifyData(event, props.yIndex, data)}
                        onKeyDown={event => props.changeRowCount(event, props.yIndex, data)}
                    />
                </th>
                <th className={styles.target}>
                    <input ref={targetData} className={styles.target_input} type="text" 
                        onChange={event => props.modifyData(event, props.yIndex, data)}
                        onKeyDown={event => props.changeRowCount(event, props.yIndex, data)}
                    />
                </th>
            </tr>
}