import React from 'react';
import MapFindPlaceRender from '@/components/MapFindPlaceRender';

export default function AddShopModal() {
    return (
        <dialog id="add-shop-modal" className="modal" style={{ position: 'fixed', zIndex: 1001 }}>
            <div className="modal-box bg-white w-11/12 max-w-5xl" style={{ zIndex: 1001 }}>
                <h3 className="font-bold text-lg">Hello!</h3>
                <p className="py-4">Click the button below to close</p>
                {/* A insérer ici */}
                <MapFindPlaceRender />
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button, it will close the modal */}
                        <button className="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}
