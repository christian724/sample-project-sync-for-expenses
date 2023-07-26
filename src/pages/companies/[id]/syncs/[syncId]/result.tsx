import { GetSyncResponse } from "@/pages/api/companies/[id]/syncs/[syncId]";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

interface SyncResult {
  succeeded: boolean;
}

const getSyncData = async (companyId: string, syncId: string) => {
  const response = await fetch(`/api/companies/${companyId}/syncs/${syncId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status !== 200) {
    throw new Error("Unable to get sync data");
  }

  const data = await response.json();
  return data as GetSyncResponse;
};

function Result() {
  const router = useRouter();
  const companyId = router.query.id as string;
  const syncId = router.query.syncId as string;

  const [syncResult, setSyncResult] = useState<GetSyncResponse>();
  const timeoutRef = useRef<number>();

  useEffect(() => {
    async function getData() {
      if (companyId === undefined) {
        return;
      }
      const data = await getSyncData(companyId, syncId);
      if (data === null) {
        timeoutRef.current = window.setTimeout(() => getData(), 1000);
        return;
      }

      setSyncResult(data);
    }

    getData();
    return () => clearTimeout(timeoutRef.current);
  }, [companyId, syncId]);

  if (!syncResult) {
    return <div>Waiting for Sync...</div>;
  }

  return (
    <main>
      <div className="flex-container">
        <h1>Sync Result</h1>
        <p>
          {syncResult.result === "success" ? "Sync Succeeded." : "Sync failed."}
          {syncResult.result === "failure" && (
            <div>Error: {syncResult.errorMessage}</div>
          )}
        </p>
      </div>
    </main>
  );
}

export default Result;