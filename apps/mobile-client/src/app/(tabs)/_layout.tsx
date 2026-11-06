import React from "react";
import { Redirect } from "expo-router";
export default function TabsLegacyLayout() {
  return <Redirect href={"/(customer)" as never} />;
}
