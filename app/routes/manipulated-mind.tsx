/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { discourseEnv } from "~/services/config.server";

export const meta: MetaFunction = () => {
  return [{ title: "The Manipulated Mind" }];
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

export default function ManipulatedMind() {
  const { pathName, discourseBaseUrl, appBaseUrl, author } =
    useLoaderData<typeof loader>();
  const embedUrl = encodeURIComponent(`${appBaseUrl}${pathName}`);
  const iframeSrc = `${discourseBaseUrl}/embed/comments?embed_url=${embedUrl}`;
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function handleLoadComments() {
    console.log(`pathname: ${pathName}`);
    setCommentsLoaded(true);
  }

  useEffect(() => {
    console.log("in the use effect callback");
    const postMessageReceived = (event: MessageEvent) => {
      if (!event) {
        return;
      }

      console.log(`event.origin: ${event.origin}`);

      window.addEventListener("message", postMessageReceived, false);

      return () => {
        window.removeEventListener("message", postMessageReceived, false);
      };
    };
  });

  return (
    <div className="max-w-screen-sm mx-auto">
      <h1>Sudden Conversion</h1>
      <p>From Eric Hoffer: The True Believer:</p>
      <p>
        Are the frustrated more easily indoctrinated than the non-frustrated?
        ...There is apparently some connection between dissatisfaction with
        oneself and a proneness for credulity. The urge to escape our real self
        is also an urge to escape the rational and obvious. The refusal to see
        ourselves as we are develops a distaste for facts and cold logic. There
        is no hope for the frustrated in the actual and possible. Salvation can
        come to them only from the miraculous....They ask to be deceived.
      </p>
      <div className="my-3">
        <button
          onClick={handleLoadComments}
          className={`border border-slate-900 rounded-sm p-2 hover:bg-slate-50`}
        >
          Load Comments
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
          ></iframe>
        )}
      </div>
    </div>
  );
}
