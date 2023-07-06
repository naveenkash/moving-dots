import { use, useEffect, useMemo, useRef, useState } from "react";
const percentageOfEmptyColumns = 20;

const shuffle = (array: any) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const Dot = (props: { backgroundColor: string }) => {
  return (
    <div className="w-8 h-8 dot flex items-center justify-center visible-dot">
      <div
        className="w-6 h-6 rounded-full shadow"
        style={{
          backgroundColor: props.backgroundColor,
        }}
      ></div>
    </div>
  );
};

const EmptyDot = () => {
  return (
    <div className="w-8 h-8 dot flex items-center justify-center empty-dot">
      <div
        className="w-6 h-6"
        style={{
          backgroundColor: `#fff`,
        }}
      ></div>
    </div>
  );
};

interface ISingleColumnProps {
  isEmpty: boolean;
  backgroundColor: string;
  _id: string;
}

export const MovingDots = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [columns, setColumns] = useState<{
    [key: number]: ISingleColumnProps[];
  }>();
  const [isMounted, setIsMounted] = useState(false);
  const [formattedRows, setFormattedRows] = useState<{ _id: string }[]>([]);

  const totalEmptyColumns = useMemo(() => {
    return Math.floor((cols / 100) * percentageOfEmptyColumns);
  }, [cols]);

  useEffect(() => {
    const container = ref.current;
    const width = container?.clientWidth ?? 0;
    const height = container?.clientHeight ?? 0;

    const dotsToAddInCols = Math.floor(width / 32);
    const dotsToAddInRows = Math.floor(height / 32);
    setCols(dotsToAddInCols);
    setRows(dotsToAddInRows);
  }, []);

  useEffect(() => {
    if (formattedRows.length) {
      return;
    }

    setFormattedRows(
      Array(rows)
        .fill(0)
        .map((_, i) => {
          const uid = Math.random().toString(36).substr(2, 9);
          return {
            _id: uid,
          };
        })
    );
  }, [rows, formattedRows]);

  useEffect(() => {
    if (!formattedRows.length || !cols || !totalEmptyColumns) {
      return;
    }
    formattedRows.map((row, i) => {
      setColumns((prev) => {
        let emptyColumns = 0;
        return {
          ...prev,
          [i]: shuffle(
            Array(cols)
              .fill(0)
              .map(() => {
                const isColumnEmpty = Math.floor(Math.random() * 100) % 2 === 0;
                const uid = Math.random().toString(36).substr(2, 9);

                if (isColumnEmpty && emptyColumns < totalEmptyColumns) {
                  emptyColumns++;
                  return {
                    _id: uid,
                    isEmpty: true,
                    backgroundColor: "white",
                  };
                }
                return {
                  _id: uid,
                  isEmpty: false,
                  backgroundColor: `${"#000000".replace(/0/g, function () {
                    return (~~(Math.random() * 16)).toString(16);
                  })}`,
                };
              })
          ),
        };
      });
    });
  }, [cols, formattedRows, totalEmptyColumns]);

  useEffect(() => {
    if (isMounted) {
      return;
    }
    if (!columns) {
      return;
    }
    setIsMounted(true);
  }, [columns, isMounted]);

  useEffect(() => {
    if (isMounted || !Object.keys(columns ?? {}).length) {
      return;
    }
    let leftDot: Element | null,
      rightDot: Element | null,
      topDot: Element | null,
      bottomDot: Element | null;

    let delayedNodes = [];
    let columnsCopy = Object.assign({}, columns);
    const calculateNodes = async () => {
      // columns state to get empty columns instead of dom
      const emptyRows = document.querySelectorAll(".valid-dot-wrapper");

      shuffle(Array.from(emptyRows)).forEach(async (emptyDot) => {
        let switchedNode = new Promise((resolve) => {
          setTimeout(async () => {
            const currentRowNumber = Number(
              emptyDot?.getAttribute("data-row") ?? 0
            );
            const currentCol = Number(emptyDot?.getAttribute("data-col") ?? 0);
            const currentDot = document.querySelector(
              `.dot-row-${currentRowNumber}.dot-col-${+currentCol}`
            );
            let randomDirection = Math.floor(Math.random() * 3);

            leftDot = document.querySelector(
              `.dot-row-${currentRowNumber}.dot-col-${+currentCol - 1}`
            );
            rightDot = document.querySelector(
              `.dot-row-${currentRowNumber}.dot-col-${+currentCol + 1}`
            );
            topDot = document.querySelector(
              `.dot-row-${+currentRowNumber - 1}.dot-col-${currentCol}`
            );
            bottomDot = document.querySelector(
              `.dot-row-${+currentRowNumber + 1}.dot-col-${currentCol}`
            );

            if (
              currentDot &&
              currentDot.classList.contains("valid-dot-wrapper") &&
              leftDot &&
              leftDot.classList.contains("empty-dot-wrapper") &&
              randomDirection === 0
            ) {
              let rowCopy = [...columnsCopy[currentRowNumber]];
              const tempLeft = rowCopy[currentCol - 1];
              const tempCurr = rowCopy[currentCol];
              rowCopy[currentCol - 1] = tempCurr;
              rowCopy[currentCol] = tempLeft;
              columnsCopy = { ...columnsCopy, [currentRowNumber]: rowCopy };
            } else if (
              currentDot &&
              currentDot.classList.contains("valid-dot-wrapper") &&
              rightDot &&
              rightDot.classList.contains("empty-dot-wrapper") &&
              randomDirection === 1
            ) {
              let rowCopy = [...columnsCopy[currentRowNumber]];

              const tempRight = rowCopy[currentCol + 1];
              const tempCurr = rowCopy[currentCol];

              rowCopy[currentCol + 1] = tempCurr;
              rowCopy[currentCol] = tempRight;

              columnsCopy = { ...columnsCopy, [currentRowNumber]: rowCopy };
            } else if (
              currentDot &&
              currentDot.classList.contains("valid-dot-wrapper") &&
              bottomDot &&
              bottomDot.classList.contains("empty-dot-wrapper") &&
              randomDirection === 2
            ) {
              let rowCopy = { ...columnsCopy };

              const tempBottom = rowCopy[+currentRowNumber + 1][+currentCol];
              rowCopy[+currentRowNumber + 1][+currentCol] =
                rowCopy[+currentRowNumber][+currentCol];
              rowCopy[+currentRowNumber][+currentCol] = tempBottom;

              columnsCopy = {
                ...columnsCopy,
                [currentRowNumber]: rowCopy[currentRowNumber],
              };
              // });
            } else if (
              currentDot &&
              currentDot.classList.contains("valid-dot-wrapper") &&
              topDot &&
              topDot.classList.contains("empty-dot-wrapper") &&
              randomDirection === 3
            ) {
              // setColumns((prev) => {
              //   if (!prev) {
              //     return;
              //   }
              let rowCopy = { ...columnsCopy };

              const tempBottom = rowCopy[+currentRowNumber - 1][+currentCol];
              rowCopy[+currentRowNumber - 1][+currentCol] =
                rowCopy[+currentRowNumber][+currentCol];
              rowCopy[+currentRowNumber][+currentCol] = tempBottom;

              columnsCopy = {
                ...columnsCopy,
                [currentRowNumber]: rowCopy[currentRowNumber],
              };
              // });
            }

            setColumns(columnsCopy);
            resolve(true);
          }, 100);
        });
        delayedNodes.push(switchedNode);
      });

      await Promise.all(delayedNodes);
    };

    (async () => {
      for (let i = 0; i < 100; i++) {
        await calculateNodes();
      }
    })();
  }, [isMounted, columns, totalEmptyColumns]);

  return (
    <div ref={ref} className="dot-container w-full h-screen">
      <div className="flex flex-wrap">
        {Object.values(columns ?? {})?.map((cols, i) => {
          return cols.map((col, j) => {
            return (
              <div
                key={col._id}
                className={`${
                  col.isEmpty
                    ? "empty-dot-wrapper z-0"
                    : "valid-dot-wrapper z-10"
                }  dot-row-${i} dot-col-${j} transition-all duration-200 relative`}
                data-row={i}
                data-col={j}
              >
                {col.isEmpty ? (
                  <EmptyDot />
                ) : (
                  <Dot backgroundColor={col.backgroundColor} />
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
