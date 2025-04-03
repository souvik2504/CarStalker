import { getAdmin } from "@/actions/admin";
import Header from "@/components/header";
import React from "react";
import Sidebar from "./_components/sidebar";

const Adminlayout = async ({children}) => {

    const admin = await getAdmin()

    if(!admin.authorized){
        return notFound();
    }

    return <div className="h-full">
        <Header isAdminPage={true} />

        <div className="flex h-full w-56 flex-col top-25 fixed inset-y-0 z-50">
            <Sidebar />
        </div>
        <main className=" md:pl-56 pt-[100px] h-full">{children}</main>
    </div>;
};

export default Adminlayout;