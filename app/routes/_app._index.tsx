import { redirect } from "react-router";

export async function loader() {
  throw redirect("/catalog");
}

export default function IndexRoute() {
  return null;
}
