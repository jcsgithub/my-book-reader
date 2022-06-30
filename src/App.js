import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import "./App.css";

function App() {
  const [content, setContent] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState([]);
  const contentRef = useRef(null);

  const linesPerPage = 19;
  const pageContentHeight = 456;

  // This function handles when a file is selected
  const handleOnChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (file && file.type !== "text/plain") {
      alert("Invalid book file!");
      setContent("");
      setCurrentPage(0);
      setTotalPages(0);
      setPages([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target.result;
      text = text.replace(/\n/g, "<br/> ");
      text = text.replace(/(\S+\s*)/g, "<span>$1</span>");
      setContent(text);
      setCurrentPage(1);
      setPages([]);
    };
    reader.readAsText(file);
  };

  // This function generates individual page containers
  const generatePages = () => {
    const contentHeight = contentRef.current.clientHeight;
    const lineHeight = contentRef.current.style.lineHeight.replace("px", "");
    const lines = contentHeight / lineHeight;
    const totalPages = Math.ceil(contentHeight / (lineHeight * linesPerPage));
    let tempPages = [];

    // console.log("lines", lines);
    // console.log("contentHeight", contentHeight);
    // console.log("linesPerPage", linesPerPage);
    // console.log("totalPages", totalPages);

    for (let i = 0; i < totalPages; i++) {
      let pageDiv = <div className="page-content"></div>;
      tempPages.push(pageDiv);
      // setPages((pages) => [...pages, pageDiv]);
    }
    setTotalPages(totalPages);
    setPages(tempPages);
  };

  const convertStringToHTML = (str) => {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
    return doc.body;
  };

  useEffect(() => {
    if (content) {
      generatePages();
    }
  }, [content]);

  useEffect(() => {
    if (pages && pages.length) {
      let cursor = 1; // cursor for the current page
      let previousInnerHTML = "";
      let spans = convertStringToHTML(content).getElementsByTagName("span");

      // console.log(spans);
      // console.log(totalPages);

      // logic to insert word by word per page
      for (let i = 0; i < spans.length; i++) {
        const html = spans[i].innerHTML;
        let pageId = "page-" + cursor;
        let pageDiv = document.getElementById(pageId);
        let pageContentDiv = pageDiv.querySelector(".page-content");

        previousInnerHTML = pageContentDiv.innerHTML;
        pageContentDiv.innerHTML += html;

        // move to next page if height exceeds the maximum
        if (pageContentDiv.offsetHeight > pageContentHeight) {
          // undo HTML content
          pageContentDiv.innerHTML = previousInnerHTML;

          // next page cursor
          cursor++;
          pageId = "page-" + cursor;
          pageDiv = document.getElementById(pageId);
          pageContentDiv = pageDiv.querySelector(".page-content");

          // insert again
          pageContentDiv.innerHTML += html;
        }

        // console.log(cursor, html);
        // if (i == 2702) break;
      }
    }
  }, [pages]);

  return (
    <Container className="m-5 mx-auto">
      <Row className="mb-3">
        <Col>
          <h1 className="mb-4 text-center">My Book Reader</h1>
          <Form>
            <Form.Group>
              <Form.Control
                type="file"
                label="Book file"
                accept=".txt"
                onChange={handleOnChange}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <Button
              variant="outline-primary"
              className="previous"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!totalPages || currentPage === 1}
            >
              Previous page
            </Button>

            <span>
              {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline-primary"
              className="next"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!totalPages || currentPage === totalPages}
            >
              Next page
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="pages mt-3 mx-auto">
            {pages.map((page, index) => (
              <div
                className={`page ${
                  index + 1 == currentPage ? `visible` : `invisible`
                }`}
                id={`page-${index + 1}`}
                key={`page-${index + 1}`}
              >
                {page}
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <div
            ref={contentRef}
            className="book-content invisible"
            style={{ lineHeight: "24px" }}
            dangerouslySetInnerHTML={{ __html: content }}
          ></div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
