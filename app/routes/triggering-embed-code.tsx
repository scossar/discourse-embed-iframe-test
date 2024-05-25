import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { discourseEnv } from "~/services/config.server";

export const meta: MetaFunction = () => {
  return [{ title: "Triggering Discourse Embed Code" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pathName = url.pathname;
  const { baseUrl } = discourseEnv();

  return json({
    pathName,
    discourseBaseUrl: baseUrl,
    appBaseUrl: "http://localhost:5173",
    author: "scossar",
  });
}

export default function TriggeringEmbedCode() {
  const { pathName, discourseBaseUrl, appBaseUrl, author } =
    useLoaderData<typeof loader>();
  const embedUrl = encodeURIComponent(`${appBaseUrl}${pathName}`);
  const iframeSrc = `${discourseBaseUrl}/embed/comments?embed_url=${embedUrl}`;
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function handleLoadComments() {
    setCommentsLoaded(true);
  }

  function normalizeUrl(url: string) {
    return url.replace(/^https?(:\/\/)?/, "");
  }

  // Calculates the vertical offset of the iframe, relative to the top
  // of the document.
  const findPosY = (obj: HTMLIFrameElement): number => {
    let top = 0;
    while (obj.offsetParent) {
      top += obj.offsetTop;
      obj = obj.offsetParent as HTMLIFrameElement;
    }
    return top;
  };

  useEffect(() => {
    console.log("in the use effect callback");
    const postMessageReceived = (event: MessageEvent) => {
      if (!event) {
        return;
      }
      if (
        !normalizeUrl(discourseBaseUrl).includes(normalizeUrl(event.origin))
      ) {
        return;
      }

      if (event.data) {
        if (event.data.type === "discourse-resize" && event.data.height) {
          if (iframeRef.current) {
            iframeRef.current.height = `${event.data.height}px`;
          }
        }
        // Handles scrolling when a reply link is clicked.
        if (
          iframeRef.current &&
          event.data.type === "discourse-scroll" &&
          event.data.top
        ) {
          const destY = findPosY(iframeRef.current) + event.data.top;
          window.scrollTo(0, destY);
        }
      }
    };

    window.addEventListener("message", postMessageReceived);

    return () => {
      window.removeEventListener("message", postMessageReceived);
    };
  }, [discourseBaseUrl]);

  return (
    <div className="max-w-screen-sm mx-auto">
      <h1>Triggering Discourse Embed Code From a User Action</h1>
      <p>This sort of works, but the UI is not great.</p>
      <p>
        When a user visits the page, they will see a Comment button. Clicking
        the button causes the comment embed iframe to be rendered. If it is the
        first time the button has been clicked, Discourse will create the topic
        (after a minute or so?). If the topic already exists, the iframe will
        appear right away.
      </p>
      <p>
        Without using some server side code, it is not easy to know if the topic
        has already been created. A hacky work around would be to make an
        unauthenticated request from the client to the topic slug (the slugified
        version of the post title). This would probably be accurate enough for
        most cases and would allow different UI to be loaded depending if the
        topic already existed.
      </p>
      <div className="my-3">
        <button
          onClick={handleLoadComments}
          className={`border border-slate-900 rounded-sm p-2 hover:bg-slate-50`}
        >
          Comments
        </button>
      </div>
      <div id="discourse-comments">
        <meta name="discourse-username" content={author} />
        {commentsLoaded && (
          <iframe
            src={iframeSrc}
            width="100%"
            id="discourse-embed-frame"
            referrerPolicy="no-referrer-when-downgrade"
            title="discourse-comments"
            ref={iframeRef}
            className="border-none"
            scrolling="no"
          ></iframe>
        )}
      </div>
    </div>
  );
}
