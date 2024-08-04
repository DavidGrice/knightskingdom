import React, { useState } from "react";
import styles from "./World.module.css";
import { WorldHeader, WorldBody } from "..";

const World = ({ setWorldData }) => {
    const [isLocalWorlds, setIsLocalWorlds] = useState(true);
    const [isSharedWorlds, setIsSharedWorlds] = useState(false);
    const [didUpdate, setDidUpdate] = useState(false);

    const changeWorld = () => {
        if (isLocalWorlds) {
            setIsLocalWorlds(!isLocalWorlds);
            setIsSharedWorlds(!isSharedWorlds);
            setDidUpdate(!didUpdate);
        } else {
            setIsSharedWorlds(!isSharedWorlds);
            setIsLocalWorlds(!isLocalWorlds);
            setDidUpdate(!didUpdate);
        }
    };

    return (
        <div className={styles.componentHolder}>
            <WorldHeader changeWorld={changeWorld} />
            <WorldBody isLocalWorlds={isLocalWorlds} didUpdate={didUpdate} setDidUpdate={setDidUpdate} setWorldData={setWorldData} />
        </div>
    );
}

export default World;