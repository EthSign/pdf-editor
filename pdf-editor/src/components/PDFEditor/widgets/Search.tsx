import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { IconLeft, IconRight, IconSearch } from "../icons";
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
  keywordLength: number
) => {
  const snippetLength = 30;
  const start = Math.max(position - snippetLength / 2, 0);
  const end = Math.min(
    position + keywordLength + snippetLength / 2,
    content.length
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
          []
        );

        return <div key={i}>{highlightedSnippet}</div>;
      });

      return {
        pageIndex,
        highlights,
      };
    })
    .filter(page => page !== null) as HighlightedPage[];
};

export const Search: React.FC = () => {
  const { connector } = useWidgetContext();

  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<HighlightedPage[]>([]);

  const total = useMemo(() => {
    return matches.reduce((acc, cur) => acc + cur.highlights.length, 0);
  }, [matches]);

  const resultVisible = useMemo(() => searchText.length !== 0, [searchText]);

  useEffect(() => {
    const eventBus = connector.eventBus;

    const onStateChange = ({ source, state, rawQuery }: any) => {
      setSearching(state === 3);

      const { _pageContents, _pageMatcherResult } = source;

      setMatches(
        highlightKeywords({
          keywordLength: rawQuery.length,
          matchPositions: _pageMatcherResult,
          pageContents: _pageContents,
        })
      );
    };

    eventBus.on("updatefindcontrolstate", onStateChange);

    return () => {
      eventBus.off("updatefindcontrolstate", onStateChange);
    };
  }, []);

  const find = (searchText: string) => {
    connector.eventBus.dispatch("find", {
      caseSensitive: false,
      entireWord: false,
      findPrevious: false,
      highlightAll: false,
      matchDiacritics: false,
      query: searchText,
    });
  };

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
            type="text"
            placeholder="Search document"
            onChange={async e => {
              const text = e.target.value;
              setSearchText(text);
              find(text);
            }}
          />
        </div>
      </div>

      {resultVisible && (
        <div className="widget-search-result">
          {searching && <div className="">loading...</div>}

          <div className="widget-search-result-bar">
            <span>{total} result found</span>

            <div className="widget-search-result-bar-icons">
              <IconLeft fill="black" width={20} height={20} />

              <IconRight fill="black" width={20} height={20} />
            </div>
          </div>

          <div className="">
            {matches.map(page => (
              <div className="widget-search-result-page" key={page.pageIndex}>
                <div className="widget-search-result-page-number">
                  Page {page.pageIndex + 1}
                </div>

                <div className="">
                  {page.highlights.map((content, index) => (
                    <div className="widget-search-result-snippet" key={index}>
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
