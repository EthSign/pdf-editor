import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IconClose, IconLeft, IconRight, IconSearch } from "../icons";
import { debounce, EventHelper } from "../utils";
import { useWidgetContext } from "./WidgetContext";

interface HighlightProps {
  matchPositions: number[][];
  pageContents: string[];
  keywordLength: number;
}

interface HighlightedPage {
  pageIndex: number;
  highlights: React.ReactNode[];
}

const getSnippet = (
  content: string,
  position: number,
  keywordLength: number,
) => {
  const snippetLength = 30;
  const start = Math.max(position - snippetLength / 2, 0);
  const end = Math.min(
    position + keywordLength + snippetLength / 2,
    content.length,
  );

  let snippet = content.slice(start, end);

  if (start > 0) {
    snippet = "..." + snippet;
  }

  if (end < content.length) {
    snippet = snippet + "...";
  }

  return snippet;
};

const highlightKeywords = ({
  matchPositions,
  pageContents,
  keywordLength,
}: HighlightProps): HighlightedPage[] => {
  return matchPositions
    .map((positions, pageIndex) => {
      if (positions.length === 0) {
        return null;
      }

      const content = pageContents[pageIndex];
      const highlights = positions.map((position, i) => {
        const snippet = getSnippet(content, position, keywordLength);
        const keyword = content.slice(position, position + keywordLength);

        // 处理分割和插入高亮的逻辑
        const parts = snippet.split(keyword);
        const highlightedSnippet = parts.reduce(
          (acc: React.ReactNode[], part, index) => {
            acc.push(<React.Fragment key={index * 2}>{part}</React.Fragment>);
            if (index < parts.length - 1) {
              acc.push(<mark key={index * 2 + 1}>{keyword}</mark>);
            }
            return acc;
          },
          [],
        );

        return <div key={i}>{highlightedSnippet}</div>;
      });

      return {
        pageIndex,
        highlights,
      };
    })
    .filter((page) => page !== null) as HighlightedPage[];
};

export const Search: React.FC = () => {
  const { connector } = useWidgetContext();

  const [searchText, setSearchText] = useState("");
  const [, setSearching] = useState(false);
  const [matches, setMatches] = useState<HighlightedPage[]>([]);

  const [activeMatchIndex, setActiveMatchIndex] = useState<{
    pageIndex: number;
    matchIndex: number;
  }>();

  const total = useMemo(() => {
    return matches.reduce((acc, cur) => acc + cur.highlights.length, 0);
  }, [matches]);

  const resultVisible = useMemo(() => searchText.length !== 0, [searchText]);

  useEffect(() => {
    const eventBus = connector.eventBus;

    const helper = new EventHelper(eventBus, {
      updatefindcontrolstate: ({ source, state, rawQuery }: any) => {
        setSearching(state === 3);

        Promise.resolve().then(() => {
          const { _pageContents, _pageMatcherResult } = source;

          setMatches(
            highlightKeywords({
              keywordLength: rawQuery.trim().length,
              matchPositions: _pageMatcherResult,
              pageContents: _pageContents,
            }),
          );
        });
      },

      findoffsetchange: ({ pageIdx, matchIdx }: any) => {
        setActiveMatchIndex({
          matchIndex: matchIdx,
          pageIndex: pageIdx,
        });
      },
    });

    helper.mount();

    return () => {
      helper.unmount();
    };
  }, []);

  const find = useCallback(
    debounce((searchText: string) => {
      setMatches([]);
      if (searchText !== "" && searchText.length < 2) return;
      connector.eventBus.dispatch("find", {
        caseSensitive: false,
        entireWord: false,
        findPrevious: false,
        highlightAll: false,
        matchDiacritics: false,
        query: searchText,
      });
    }, 200),
    [],
  );

  return (
    <div
      className={clsx("widget-search-wrapper", {
        open: resultVisible,
      })}
    >
      <div className="widget-search">
        <div className="widget-search-input-container">
          <IconSearch fill="#667085" width={20} height={20} />
          <input
            value={searchText}
            type="text"
            placeholder="Search document"
            onChange={async (e) => {
              const text = e.target.value;
              setSearchText(text);
              find(text);
            }}
          />
          <div className="widget-search-input-clear-button">
            <IconClose
              fill="#667085"
              width={20}
              height={20}
              onClick={() => {
                setSearchText("");
                find("");
              }}
            />
          </div>
        </div>
      </div>

      {resultVisible && (
        <div className="widget-search-result">
          {/* {searching && <div className="">loading...</div>} */}

          <div className="widget-search-result-bar">
            <span>{total} result found</span>

            <div className="widget-search-result-bar-icons">
              <IconLeft
                fill="#868e96"
                width={20}
                height={20}
                onClick={() => {
                  connector.eventBus.dispatch("find", {
                    caseSensitive: false,
                    entireWord: false,
                    findPrevious: true,
                    highlightAll: false,
                    matchDiacritics: false,
                    query: searchText,
                    type: "again",
                  });
                }}
              />

              <IconRight
                fill="#868e96"
                width={20}
                height={20}
                onClick={() => {
                  connector.eventBus.dispatch("find", {
                    caseSensitive: false,
                    entireWord: false,
                    findPrevious: false,
                    highlightAll: false,
                    matchDiacritics: false,
                    query: searchText,
                    type: "again",
                  });
                }}
              />
            </div>
          </div>

          <div className="">
            {matches.map((page) => (
              <div className="widget-search-result-page" key={page.pageIndex}>
                <div className="widget-search-result-page-number">
                  Page {page.pageIndex + 1}
                </div>

                <div className="">
                  {page.highlights.map((content, matchIndex) => (
                    <div
                      className={clsx("widget-search-result-snippet", {
                        active:
                          activeMatchIndex?.pageIndex === page.pageIndex &&
                          activeMatchIndex.matchIndex === matchIndex,
                      })}
                      key={matchIndex}
                      onClick={() => {
                        connector.app.findController.gotoMatch(
                          page.pageIndex,
                          matchIndex,
                        );
                      }}
                    >
                      {content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
