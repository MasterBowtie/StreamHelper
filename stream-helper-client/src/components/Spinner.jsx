import React, { Component } from "react";
import styles from  '../css/spinner.module.css';

function Spinner(props) {


    return (
        <div id={styles.container}>
            <div className={`${styles.photobanner} ${styles.photobanner_2}`}>
                {props.colors.map((color, index)=> {
                    return <div key={`box_${index}`} style={{backgroundColor: color}} className={styles.block}>Box {index}</div>
                })}
            </div>
            <div className={styles.photobanner}>
                {props.colors.map((color, index)=> {
                    return <div key={`box_${index}`} style={{backgroundColor: color}} className={styles.block}>Box {index}</div>
                })}
            </div>
        </div>
    )
}

export { Spinner }