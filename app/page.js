// app/page.js
"use client";
import { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import Block from "./components/Block";

export default function Home() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/blocks");
            if (!response.ok) {
                throw new Error("Failed to fetch blocks");
            }
            const blocks = await response.json();

            // Fetch the latest selection
            const selectionResponse = await fetch("http://localhost:3001/api/selections/latest");
            if (!selectionResponse.ok) {
                throw new Error("Failed to fetch latest selection");
            }
            const { blockIds } = await selectionResponse.json();

            // Mark selected blocks
            const updatedBlocks = blocks.map((block) => ({
                ...block,
                selected: blockIds.includes(block._id),
            }));

            setBlocks(updatedBlocks);
        } catch (error) {
            setError("Failed to load blocks");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockSelect = (blockId) => {
        setBlocks((prevBlocks) => {
            return prevBlocks.map((block) => {
                const isCurrentBlock = block._id === blockId;

                if (block.type === "single") {
                    // For single type: unselect all others, toggle only if current
                    return {
                        ...block,
                        selected: isCurrentBlock ? !block.selected : false,
                    };
                } else if (block.type === "groupped") {
                    // For grouped type: toggle selection for current block
                    if (isCurrentBlock) {
                        return {
                            ...block,
                            selected: isCurrentBlock ? !block.selected : false,
                        };
                    }
                    // Deselect single blocks if grouped block is selected
                    return {
                        ...block,
                        selected: block.selected && block.type !== "single",
                    };
                }
                //return block; // No change for unrelated cases
            });
        });
    };

    const getSelectedBlockIds = () => {
        return blocks.filter((block) => block.selected).map((block) => block._id);
    };

    const isSubmitDisabled = () => {
        return blocks.filter((block) => block.selected).length === 0;
    };

    const handleSubmit = async () => {
        try {
            const selectedBlockIds = getSelectedBlockIds();

            const response = await fetch("http://localhost:3001/api/selections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ blockIds: selectedBlockIds }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to submit selection");
            }

            const data = await response.json();
            alert("Selection saved successfully!");

            // Update the blocks state to reflect the saved selections
            setBlocks((prevBlocks) =>
                prevBlocks.map((block) => ({
                    ...block,
                    selected: selectedBlockIds.includes(block._id),
                }))
            );
        } catch (error) {
            alert(error.message);
            console.error("Error submitting selection:", error);
        }
    };

    if (loading) return <div>Loading blocks...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <main className={styles.container}>
            <div className={styles.main}>
                {blocks.map((block) => (
                    <Block
                        key={block._id}
                        {...block}
                        onClick={() => handleBlockSelect(block._id)}
                    />
                ))}
            </div>
            <button
                className={`${styles.btnMain} ${isSubmitDisabled() ? styles.disabled : ""}`}
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
            >
                Submit
            </button>
        </main>
    );
}
