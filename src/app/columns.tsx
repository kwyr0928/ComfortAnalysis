"use client"
 
import { type ColumnDef } from "@tanstack/react-table"
 
export type Data = {
  id: number
  date: string
  kinds: string
  title: string
}
 
export const columns: ColumnDef<Data>[] = [
  {
    accessorKey: "date",
    header: "日時",
  },
  {
    accessorKey: "kinds",
    header: "種類",
  },
  {
    accessorKey: "title",
    header: "メッセージ",
  },
]