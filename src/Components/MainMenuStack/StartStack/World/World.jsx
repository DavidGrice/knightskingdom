import React, { useState } from "react";
import styles from "./World.module.css";
import { WorldHeader, WorldBody, LocalWorlds, SharedWorlds } from "..";

const World = ({ navigateToStart }) => {
    const [isLocalWorlds, setIsLocalWorlds] = useState(true);

    const changeWorld = () => {
        setIsLocalWorlds(!isLocalWorlds);
    };

    return (
        <div className={styles.componentHolder}>
            <WorldHeader isLocalWorlds={isLocalWorlds} changeWorld={changeWorld} />
            <WorldBody isLocalWorlds={isLocalWorlds} />
        </div>
    );
}

export default World;