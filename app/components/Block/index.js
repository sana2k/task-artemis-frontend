import styles from "./styles.module.scss";

const Block = ({ title, description, icon, onClick, disabled = false, type = "single", selected = false }) => {
    const handleCheckboxChange = (e) => {
        //e.stopPropagation(); // Stop event from bubbling to button
        onClick(); // Call the parent's onClick handler
    };

    return (
        <button className={`${styles.block} ${selected ? styles.active : ""} ${disabled ? styles.disabled : ""}`} type="button">
            <div className={styles.grouppedCheckbox}>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={handleCheckboxChange} // Only handle checkbox changes
                    className={styles.checkbox}
                    disabled={disabled}
                />
            </div>
            <div className={styles.blockIcon}>
                <img src={icon} alt={title} />
            </div>
            <div className={styles.blockContent}>
                <div className={styles.blockTitle}>{title}</div>
                <div className={styles.blockDescription}>
                    {description ? `${description} - ${type}` : type}
                </div>
            </div>
        </button>
    );
};

export default Block;
