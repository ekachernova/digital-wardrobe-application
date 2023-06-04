import styles from "../../styles.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { storeVariables } from "@/store/storeVariables";
import { useSnapshot } from "valtio";
import Box from "../Box";
import Weather from "../Weather";
import Bucket from "../Bucket";

export default function Wardrobe({ key }) {
  const { globalWeather } = useSnapshot(storeVariables);

  const [items, setItems] = useState([{ title: "initial title" }]);

  useEffect(() => {
    syncItems();
  }, []);

  const syncItems = async () => {
    const response = await fetch("/api/items");
    const jsonData = await response.json();

    setItems(jsonData.data);
    // storeVariables.globalWardrobe = items;
  };

  // create new wardrobe item
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Get data from the form.
    const data = {
      title: event.target.title.value,
      category: event.target.category.value,
      colour: event.target.colour.value,
      season: event.target.season.value,
      url: event.target.url.value,
    };

    const JSONdata = JSON.stringify(data);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSONdata,
    };

    const response = await fetch("/api/items", options);

    const result = await response.json();

    syncItems();
  };

  const handleDeleteItem = (id) => {
    return async () => {
      console.log(`handler with id: ${id}`);
      await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });
      // can be a call to syncItems() instead
      setItems((items) => items.filter((i) => i._id != id));
    };
  };

  const handleFilterButton = (event) => {
    if (globalWeather.current.temp_c >= 15) {
      setItems((items) =>
        items.filter((item) => item.season === "all" || item.season === "warm")
      );
    }
    if (
      globalWeather.current.temp_c >= 15 &&
      globalWeather.current.condition.code >= 1063
    ) {
      setItems((items) =>
        items.filter(
          (item) => item.season === "all" || item.season === "warm-rainy"
        )
      );
    }
    if (globalWeather.current.temp_c < 15) {
      setItems((items) =>
        items.filter((item) => item.season === "all" || item.season === "cold")
      );
    }
    if (
      globalWeather.current.temp_c < 15 &&
      globalWeather.current.condition.code >= 1063
    ) {
      setItems((items) =>
        items.filter(
          (item) => item.season === "all" || item.season === "cold-rainy"
        )
      );
    }
    return;
  };

  return (
    <div>
      <div className={styles.formContainer}>
        <Weather />
        <div className={styles.form}>
          <h3>Add your clothes to the wardrobe</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title">Title</label>
              <br></br>
              <input type="text" id="title" name="title" required />
            </div>
            <div>
              <label htmlFor="category">Category</label>
              <br></br>
              <input type="text" id="category" name="category" required />
            </div>
            <div>
              <label htmlFor="colour">Colour</label>
              <br></br>
              <input type="text" id="colour" name="colour" required />
            </div>
            <div>
              <label htmlFor="season">Season</label>
              <br></br>
              {/* <input type="text" id="season" name="season" required /> */}
              <select name="season" id="season" required>
                <option value="warm">warm</option>
                <option value="cold">cold</option>
                <option value="cold-rainy">cold rainy</option>
                <option value="warm-rainy">warm rainy </option>
                <option value="all">all </option>
              </select>
            </div>
            <div>
              <label htmlFor="url">URL</label>
              <br></br>
              <input type="text" id="url" name="url" required />
            </div>
            <br></br>
            <button className={styles.addItemButton} type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
      <div>
        <button className={styles.filterButton} onClick={handleFilterButton}>
          Sync your wardrobe!
        </button>
      </div>
      <div className={styles.wardrobeAndOutfitsWrapper}>
        <div className={styles.createWardrobeWrapper}>
          <div className={styles.wardrobeSection}>
            {items.map((item, i) => {
              return (
                <Box
                  id={item._id}
                  url={item.url}
                  key={"box_key_" + item._id}
                  index={"boxed_image_key" + item._id}
                  clickHandler={handleDeleteItem(item._id)}
                />
              );
            })}
          </div>
        </div>
        <Bucket key={key} />
      </div>
    </div>
  );
}
